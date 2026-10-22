'use strict';

const vm = require('vm');
const {
  BROWSER_ENV_SOURCE,
  BROWSER_ENV_SOURCE_EXTERNAL_SURFACE,
  FULL_BROWSER_SURFACE
} = require('./browser-env-source');
const { installNativeDocumentAllGlobal } = require('./native-document-all');

function installBrowserEnv(config = {}) {
  const hadConfig = Object.prototype.hasOwnProperty.call(globalThis, '__browserEnvConfig');
  const previousConfig = globalThis.__browserEnvConfig;
  const hadHostRequire = Object.prototype.hasOwnProperty.call(globalThis, '__miniBrowserHostRequire');
  const previousHostRequire = globalThis.__miniBrowserHostRequire;
  const hadFullBrowserSurface = Object.prototype.hasOwnProperty.call(globalThis, '__miniBrowserFullBrowserSurface');
  const previousFullBrowserSurface = globalThis.__miniBrowserFullBrowserSurface;
  globalThis.__browserEnvConfig = config || {};
  Object.defineProperty(globalThis, '__miniBrowserHostRequire', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: require
  });
  Object.defineProperty(globalThis, '__miniBrowserFullBrowserSurface', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: FULL_BROWSER_SURFACE
  });

  try {
    vm.runInThisContext(BROWSER_ENV_SOURCE_EXTERNAL_SURFACE || BROWSER_ENV_SOURCE, {
      filename: 'browser-env-source.js',
      timeout: 1000
    });
  } finally {
    if (hadConfig) {
      globalThis.__browserEnvConfig = previousConfig;
    } else {
      delete globalThis.__browserEnvConfig;
    }
    if (hadHostRequire) {
      Object.defineProperty(globalThis, '__miniBrowserHostRequire', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: previousHostRequire
      });
    } else {
      delete globalThis.__miniBrowserHostRequire;
    }
    if (hadFullBrowserSurface) {
      Object.defineProperty(globalThis, '__miniBrowserFullBrowserSurface', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: previousFullBrowserSurface
      });
    } else {
      delete globalThis.__miniBrowserFullBrowserSurface;
    }
  }

  installNativeDocumentAllGlobal(globalThis);

  return globalThis.__mini_browser__;
}

module.exports = {
  installBrowserEnv,
  BROWSER_ENV_SOURCE,
  BROWSER_ENV_SOURCE_EXTERNAL_SURFACE
};
