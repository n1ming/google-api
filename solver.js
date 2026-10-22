'use strict';

// google_sgss_runner.js v2 — mini_browser worker：完整 FF151 环境执行 Google knitsail
// 挑战页，产出 SG_SS token + VM location.replace 产生的下一跳 URL。
// 依据（2026-10-21）：
//  - 知识库《谷歌搜索 sg_ss 分析》（2026-08-05）：挑战页 location.replace → 带 sei 下一跳 →
//    同会话请求下一跳 → SERP；随后 SG_SS=0 消费一次性 cookie。performance.now 被全量调用
//    800+ 次（校验精度）→ 本环境把 now 量化为 1ms 整数（真 Firefox 151 实测）。
//  - 本机 ruyipage FF151 真值：无 userAgentData/deviceMemory/vendor=''、plugins 5、
// 输入(stdin JSON)：{ pageURL, pageHTML, userAgent, cookieSeed, waitMs }
// 输出(stdout)：:::RESULT_BASE64:<base64-json>::: { ok, sgss, nextHopURL, finalURL, timings }

const fs = require('node:fs');
const nodeProcess = process;
const nodeBuffer = Buffer;
const path = require('node:path');

function elapsedMs(started) {
  return Number(nodeProcess.hrtime.bigint() - started) / 1e6;
}

function resolveCoreRoot() {
    const candidates = [
    nodeProcess.env.MINI_BROWSER_20VM_DIR,
    nodeProcess.env.MINI_BROWSER_ROOT,
    nodeProcess.env.GOOGLE_CORE_DIR,
  ].filter(Boolean);
  for (const candidate of candidates) {
    const root = path.resolve(candidate);
    if (fs.existsSync(root + '/lib/install-browser-env.js')) return root;
  }
  throw new Error('Could not locate mini_browser core. Set MINI_BROWSER_20VM_DIR.');
}
const { installBrowserEnv } = require(path.join(resolveCoreRoot(), 'lib', 'install-browser-env.js'));
const { buildHarmonizer } = require(path.join(path.dirname(__filename), 'harmonize.js'));

function readPayload() {
  const raw = fs.readFileSync(0, 'utf8');
  if (!raw.trim()) throw new Error('Missing stdin JSON payload.');
  return JSON.parse(raw);
}

function writeResult(result) {
  const encoded = nodeBuffer.from(JSON.stringify(result), 'utf8').toString('base64');
  nodeProcess.stdout.write(`:::RESULT_BASE64:${encoded}:::` + '\n');
}

// Chrome 155 环境（声称与 curl_cffi chrome131 TLS/UA155 头一致；基准=js-reverse 真 Chrome155 采集）
function buildEnvironment(payload) {
  const ua = payload.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
  const url = new URL(payload.pageURL);
  return {
    location: {
      href: url.href, origin: url.origin, protocol: url.protocol,
      host: url.host, hostname: url.hostname, port: url.port || '',
      pathname: url.pathname, search: url.search, hash: ''
    },
    document: {
      cookie: payload.cookieSeed || '',
      referrer: url.origin + '/',
      readyState: 'complete',
      URL: url.href,
      documentURI: url.href,
      hidden: false,
      visibilityState: 'visible'
    },
    navigator: {
      userAgent: ua,
      appVersion: ua.replace(/^Mozilla\//, ''),
      language: 'zh-CN',
      languages: ['zh-CN', 'en'],
      platform: 'Win32',
      hardwareConcurrency: 8,
      deviceMemory: 16,
      vendor: 'Google Inc.',
      product: 'Gecko',
      productSub: '20030107',
      cookieEnabled: true,
      onLine: true,
      doNotTrack: null,
      webdriver: false,
      maxTouchPoints: 0,
      userAgentData: {
        brands: [
          { brand: 'Google Chrome', version: '155' },
          { brand: 'Chromium', version: '155' },
          { brand: 'Not(A:Brand', version: '24' }
        ],
        mobile: false,
        platform: 'Windows'
      }
    },
    screen: {
      width: 1920, height: 1080,
      availWidth: 1920, availHeight: 1040,
      colorDepth: 24, pixelDepth: 24,
      availLeft: 0, availTop: 0,
      isExtended: false,
      orientation: { angle: 0, type: 'landscape-primary' }
    },
    window: {
      innerWidth: 1280, innerHeight: 720,
      outerWidth: 1290, outerHeight: 730,
      screenX: 0, screenY: 0,
      devicePixelRatio: 1
    },
    // 真 Chrome：0.1ms 量化 + 页面已存在 ~15s 的 now() 量级；GPU 参考串
    performance: {
      timeOrigin: Date.now() - (Number(payload.elapsedMs) || 14500)
    },
    webgl: {
      UNMASKED_VENDOR_WEBGL: 'Google Inc. (Intel)',
      UNMASKED_RENDERER_WEBGL: 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)'
    },
    localStorage: { entries: {} },
    sessionStorage: { entries: {} },
    network: { defaultStatus: 200, defaultStatusText: 'OK', defaultBody: '' }
  };
}

async function waitSgss(timeoutMs) {
  const started = nodeProcess.hrtime.bigint();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const m = /(?:^|;\s*)SG_SS=([^;]+)/.exec(String(document.cookie || ''));
    if (m && m[1] && m[1] !== '0') {
      // 再给 VM 一点时间完成 location.replace，捕获下一跳
      await new Promise((r) => setTimeout(r, 120));
      const hrefNow = safeHref();
      return { sgss: m[1], nextHopURL: hrefNow, elapsedMs: elapsedMs(started) };
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return { sgss: null, nextHopURL: safeHref(), elapsedMs: elapsedMs(started) };
}

function safeHref() {
  try { return String(location.href); } catch (e) { return null; }
}

async function run(payload) {
  const totalStarted = nodeProcess.hrtime.bigint();
  if (!payload.pageURL || !payload.pageHTML) {
    throw new Error('payload requires pageURL and pageHTML');
  }
  // ★ 预 seed：让 core 内的 chrome/userAgentData/deviceMemory 装配点直接跳过
  globalThis.MINI_BROWSER_HIDES = { chrome: false, deviceMemory: false, userAgentData: false };

  const installStarted = nodeProcess.hrtime.bigint();
  installBrowserEnv({ environment: buildEnvironment(payload) });
  const installMs = elapsedMs(installStarted);

  // 结构对齐层：真 Chrome155 基准（成员集/顺序/描述符）
  let harmonizerReport = null;
  try { harmonizerReport = buildHarmonizer().run(); } catch (e) { harmonizerReport = { error: String(e) }; }
  // 对齐层收尾：擦除注入钩子（own property 不能留在 window）
  try { Reflect.deleteProperty(globalThis, '__miniRegisterNative'); } catch (e) {}

  const loadStarted = nodeProcess.hrtime.bigint();
  __mini_browser__.page.load({
    baseURL: payload.pageURL,
    html: payload.pageHTML
  });
  const loadMs = elapsedMs(loadStarted);

  const wait = await waitSgss(Number(payload.waitMs) || 12000);
  await new Promise((r) => setTimeout(r, 200));
  const cookieNow = String(document.cookie || '');
  let hstat = null;
  if (harmonizerReport && Array.isArray(harmonizerReport)) {
    hstat = { classes: harmonizerReport.length, removed: 0, added: 0, reordered: 0 };
    for (const r of harmonizerReport) { hstat.removed += (r.removed || []).length; hstat.added += (r.added || []).length; hstat.reordered += r.reordered ? 1 : 0; }
  }
  return {
    ok: !!wait.sgss,
    sgss: wait.sgss,
    nextHopURL: safeHref(),
    harmonizer: hstat,
    cookieLength: cookieNow.length,
    documentCookieNames: cookieNow.split(';').map(s => s.split('=')[0].trim()).filter(Boolean),
    timings: {
      installMs: Math.round(installMs * 1000) / 1000,
      pageLoadMs: Math.round(loadMs * 1000) / 1000,
      waitMs: Math.round(wait.elapsedMs * 1000) / 1000,
      totalMs: Math.round(elapsedMs(totalStarted) * 1000) / 1000
    }
  };
}

if (require.main === module) {
  run(readPayload()).then((result) => {
    writeResult(result);
    nodeProcess.exit(result.ok ? 0 : 2);
  }).catch((error) => {
    writeResult({ ok: false, error: error && error.stack ? error.stack : String(error) });
    nodeProcess.exit(1);
  });
}
