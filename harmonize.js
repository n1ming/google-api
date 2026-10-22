'use strict';
// chrome_harmonize.js —— mini_browser post-install 结构对齐层（真 Chrome 155 基准）
// 数据源: work/gt/chrome_https_p1/2/3.json（js-reverse 真 Chrome 155 https://example.org 采集）
// 模块（web-reverse-env 方法论）:
//   descriptor-guard + prototype-builder + native-protector（借 core 的 __miniRegisterNative）
//   对齐动作：多余成员删除 / 缺失成员补建 / 原型成员 ORDER 重排 / 内部 __* 泄漏擦除
'use strict';

const path = require('node:path');
const fs = require('node:fs');

function loadBaseline() {
  const merged = JSON.parse(fs.readFileSync(path.join(__dirname, 'baselines.json'), 'utf8'));
  return Object.assign({}, merged.part1 || {}, merged.part2 || {}, merged.part3 || {});
}

// Range 常量（WHATWG DOM）
const KNOWN_CONSTANTS = {
  START_TO_START: 1, START_TO_END: 2, END_TO_END: 3, END_TO_START: 4,
};

function hostProcessEnvFlag(name) {
  try { return String((globalThis.process && globalThis.process.env && globalThis.process.env[name]) || '') === '1'; } catch (e) { return false; }
}

function buildHarmonizer() {
  const baseline = loadBaseline();
  const register = globalThis.__miniRegisterNative;

  function nativeFn(lambda, publicName) {
    const fn = function () { return lambda.apply(this, arguments); };
    if (register) register(fn, publicName || '');
    return fn;
  }
  function nativeGetter(name) {
    const fn = function () { return null; };
    if (register) register(fn, 'get ' + name);
    return fn;
  }
  function nativeSetter(name) {
    const fn = function () {};
    if (register) register(fn, 'set ' + name);
    return fn;
  }

  function defineMissingMember(P, m, report) {
    let d;
    if (/^on[a-z]/.test(m)) {
      d = { get: nativeGetter(m), set: nativeSetter(m), enumerable: true, configurable: true };
    } else if (/^[A-Z][A-Z0-9_]+$/.test(m)) {
      d = { value: KNOWN_CONSTANTS[m] !== undefined ? KNOWN_CONSTANTS[m] : 0, writable: false, enumerable: true, configurable: false };
    } else {
      d = { value: nativeFn(function () { return undefined; }, m), writable: true, enumerable: true, configurable: true };
    }
    try {
      Object.defineProperty(P, m, d);
      report.added.push(m);
    } catch (e) {
      report.addFailed.push(m + ':' + (e && e.message));
    }
  }

  function alignPrototype(target, name, baselineMembers, opts) {
    const report = { name, removed: [], added: [], addFailed: [], reordered: false, owner: opts && opts.instance ? 'instance' : 'prototype' };
    if (!target) { report.skipped = 'target-missing'; return report; }
    const P = target;
    let current;
    try { current = Object.getOwnPropertyNames(P); } catch (e) { report.skipped = 'ownNames-error'; return report; }

    // 1) 多余成员删除（保留 constructor）
    for (const m of current) {
      if (m === 'constructor') continue;
      if (!baselineMembers.includes(m)) {
        try { Reflect.deleteProperty(P, m); report.removed.push(m); } catch (e) { report.removed.push(m + '(FAIL)'); }
      }
    }

    // 2) 缺失成员补建
    current = Object.getOwnPropertyNames(P);
    for (const m of baselineMembers) {
      if (m === 'constructor') continue;
      if (!current.includes(m)) defineMissingMember(P, m, report);
    }

    // 3) ORDER 重排：按 baseline 顺序 delete+redefine
    const descs = new Map();
    for (const m of Object.getOwnPropertyNames(P)) {
      try { descs.set(m, Object.getOwnPropertyDescriptor(P, m)); } catch (e) { descs.set(m, null); }
    }
    let orderOk = true;
    for (const m of baselineMembers) {
      if (!descs.has(m)) { orderOk = false; break; }
    }
    if (orderOk) {
      for (const m of descs.keys()) { try { Reflect.deleteProperty(P, m); } catch (e) {} }
      for (const m of baselineMembers) {
        const d = descs.get(m);
        if (d) { try { Object.defineProperty(P, m, d); } catch (e) {} }
      }
      report.reordered = true;
    }
    // 泄漏检查复发报告
    const leaked = Object.getOwnPropertyNames(P).filter(x => x.startsWith('__'));
    if (leaked.length) report.leaked = leaked;
    return report;
  }

  function run() {
    const reports = [];

    // p1: 基础 prototype/instance
    const p1map = {
      nav_proto_members: ['Navigator', true, false],
      location_props: ['Location', true, false],
      history_props: ['History', true, false],
      screen_proto_props: ['Screen', true, false],
      storage_proto_props: ['Storage', true, false],
      crypto_proto_props: ['Crypto', true, false],
      perf_proto_props: ['Performance', true, false],
    };
    for (const [key, [className, isProto]] of Object.entries(p1map)) {
      const list = baseline[key];
      if (!list) continue;
      const members = String(list).split(',');
      const C = globalThis[className];
      reports.push(alignPrototype(C && C.prototype, className, members));
    }
    // location 实例 own 对齐（真 Chrome：valueOf,ancestorOrigins,href,...replace,toString）
    if (baseline.location_own) {
      const members = String(baseline.location_own).split(',');
      try {
        reports.push(alignPrototype(location, 'location(inst)', members, { instance: true }));
      } catch (e) {}
    }

    // p2/p3: 全部 class prototype
    for (const [key, val] of Object.entries(baseline)) {
      if (val === "ABSENT" || val === null || typeof val !== 'string' || !val.includes(',')) continue;
      if (key in p1map || key === 'location_own' || key === 'windowOwnProps' || key === 'nav_own' ||
          key === 'window_enumerable_own' || key.startsWith('nav_desc') || key === 'uad_brands') continue;
      const members = val.split(',');
      const C = globalThis[key];
      if (!C || !C.prototype) continue;
      reports.push(alignPrototype(C.prototype, key, members));
    }

    // window own 集合 + 顺序（2026-10-21 深挖）
    // 注意：example.org 基准缺 sharedStorage 族，但 google.com.hk 上下文的真 Chrome 大概率暴露
    //      （Permissions-Policy/来源不同）→ 移除它们会倒退。默认关；CHROME_HARMONIZE_WINDOW=1 才启用。
    if (baseline.windowOwnProps && hostProcessEnvFlag('CHROME_HARMONIZE_WINDOW')) {
      try {
        reports.push(alignWindowOwnProps(String(baseline.windowOwnProps).split(',')));
      } catch (e) {
        reports.push({ name: 'window(own)', error: String(e) });
      }
    }

    return reports;
  }

  // —— window own 集合/顺序对齐 ——
  function makeStubConstructor(name) {
    const proto = { [Symbol.toStringTag]: 'Object' };
    const ctor = nativeFn(function () { throw new TypeError('Illegal constructor'); }, name);
    try {
      Object.defineProperty(ctor, 'prototype', { value: proto, writable: false, enumerable: false, configurable: false });
      Object.defineProperty(proto, 'constructor', { value: ctor, writable: true, enumerable: false, configurable: true });
    } catch (e) {}
    return ctor;
  }

  function recoverExistingClass(name) {
    // 尽量从存活实例恢复真类，避免 stub
    try {
      if (name === 'FontFaceSet' && document.fonts) return document.fonts.constructor;
      if (name === 'PermissionsPolicy' && window.featurePolicy) return window.featurePolicy.constructor;
      if (name === 'VisualViewport' && window.visualViewport) return window.visualViewport.constructor;
      if (name === 'ScreenOrientation' && screen.orientation) return screen.orientation.constructor;
      if (name === 'BarProp' && window.locationbar) return window.locationbar.constructor;
      if (name === 'Performance' && globalThis.Performance) return globalThis.Performance;
      if (name === 'Crypto' && globalThis.Crypto) return globalThis.Crypto;
    } catch (e) {}
    return null;
  }

  function alignWindowOwnProps(baselineMembers) {
    const report = { name: 'window(own)', removed: [], added: [], reordered: false };
    const g = globalThis;
    const current = Object.getOwnPropertyNames(g);
    const base = new Set(baselineMembers);

    // 1) 删多余
    for (const m of current) {
      if (!base.has(m)) {
        try {
          const d = Object.getOwnPropertyDescriptor(g, m);
          if (d && d.configurable) { Reflect.deleteProperty(g, m); report.removed.push(m); }
        } catch (e) {}
      }
    }

    // 2) 补缺失
    for (const m of baselineMembers) {
      if (Object.getOwnPropertyDescriptor(g, m)) continue;
      try {
        if (/^[A-Z]/.test(m)) {
          let cls = recoverExistingClass(m);
          if (!cls) cls = makeStubConstructor(m);
          Object.defineProperty(g, m, { value: cls, writable: true, enumerable: false, configurable: true });
        } else {
          const fn = nativeFn(function () { return undefined; }, m);
          Object.defineProperty(g, m, { value: fn, writable: true, enumerable: true, configurable: true });
        }
        report.added.push(m);
      } catch (e) {
        report.addFailed = report.addFailed || [];
        report.addFailed.push(m);
      }
    }

    // 3) 安全重排：全部 own 描述符可配置才动
    const names = Object.getOwnPropertyNames(g);
    let allConfigurable = true;
    const descs = new Map();
    for (const m of names) {
      const d = Object.getOwnPropertyDescriptor(g, m);
      if (!d) { allConfigurable = false; break; }
      descs.set(m, d);
      if (!d.configurable) { allConfigurable = false; break; }
    }
    if (allConfigurable) {
      const orderOk = baselineMembers.every(m => descs.has(m));
      if (orderOk) {
        for (const m of descs.keys()) Reflect.deleteProperty(g, m);
        for (const m of baselineMembers) Object.defineProperty(g, m, descs.get(m));
        report.reordered = true;
      }
    } else {
      report.reorderSkipped = 'non-configurable present';
    }
    const leaked = Object.getOwnPropertyNames(g).filter(x => x.startsWith('__'));
    if (leaked.length) report.leaked = leaked;
    return report;
  }

  return { run, baseline: () => Object.keys(baseline).length, alignWindowOwnProps };
}

module.exports = { buildHarmonizer };
