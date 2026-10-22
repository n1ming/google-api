'use strict';

const vm = require('node:vm');
const { BROWSER_ENV_SOURCE } = require('./browser-env-source');

function createBaseSandbox(globals = {}) {
  const sandbox = Object.assign(Object.create(null), {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    queueMicrotask,
    structuredClone: typeof structuredClone === 'function' ? structuredClone : undefined
  }, globals);

  sandbox.globalThis = sandbox;
  return sandbox;
}

function createBrowserContext(config = {}, options = {}) {
  const sandbox = createBaseSandbox(options.globals);
  sandbox.__browserEnvConfig = config || {};

  const context = vm.createContext(sandbox, {
    name: options.name || 'mini-browser'
  });

  vm.runInContext(BROWSER_ENV_SOURCE, context, {
    filename: 'browser-env-source.js',
    timeout: options.installTimeout || 1000,
    displayErrors: true
  });

  delete sandbox.__browserEnvConfig;

  return {
    context,
    global: sandbox,
    run(source, runOptions = {}) {
      return vm.runInContext(String(source), context, {
        filename: runOptions.filename || options.filename || 'target.js',
        timeout: runOptions.timeout || options.timeout || 1000,
        displayErrors: true
      });
    },
    async runAsync(source, runOptions = {}) {
      return await this.run(source, runOptions);
    }
  };
}

function runBrowserCode(source, config = {}, options = {}) {
  const browser = createBrowserContext(config, options);
  return browser.run(source, options);
}

module.exports = {
  createBrowserContext,
  runBrowserCode,
  BROWSER_ENV_SOURCE
};
