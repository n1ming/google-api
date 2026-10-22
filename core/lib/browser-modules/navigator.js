'use strict';

const NAVIGATOR_DEFAULTS = Object.freeze({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  appCodeName: 'Mozilla',
  appName: 'Netscape',
  appVersion: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
  platform: 'Win32',
  product: 'Gecko',
  productSub: '20030107',
  vendor: 'Google Inc.',
  vendorSub: '',
  language: 'zh-CN',
  languages: ['zh-CN', 'zh'],
  onLine: true,
  cookieEnabled: true,
  pdfViewerEnabled: true,
  webdriver: false,
  hardwareConcurrency: 16,
  deviceMemory: 32,
  maxTouchPoints: 0,
  doNotTrack: null
});

function appVersionFromUserAgent(userAgent) {
  return String(userAgent || '').replace(/^Mozilla\//, '');
}

function platformFromUserAgent(userAgent) {
  const text = String(userAgent || '');
  if (/\bWindows NT\b/i.test(text)) return 'Win32';
  if (/\bMac OS X\b|\bMacintosh\b/i.test(text)) return 'MacIntel';
  if (/\bLinux\b/i.test(text)) return 'Linux x86_64';
  return undefined;
}

function buildNavigatorDefaults(overrides = {}) {
  const source = overrides || {};
  const values = Object.assign({}, NAVIGATOR_DEFAULTS, source);
  if (Object.prototype.hasOwnProperty.call(source, 'userAgent')) {
    if (!Object.prototype.hasOwnProperty.call(source, 'appVersion')) {
      values.appVersion = appVersionFromUserAgent(source.userAgent);
    }
    if (!Object.prototype.hasOwnProperty.call(source, 'platform')) {
      const platform = platformFromUserAgent(source.userAgent);
      if (platform !== undefined) values.platform = platform;
    }
  }
  return values;
}

module.exports = {
  NAVIGATOR_DEFAULTS,
  appVersionFromUserAgent,
  platformFromUserAgent,
  buildNavigatorDefaults
};
