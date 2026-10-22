'use strict';

const NAVIGATOR_UA_DATA_DEFAULTS = Object.freeze({
  brands: [
    { brand: 'Google Chrome', version: '149' },
    { brand: 'Chromium', version: '149' },
    { brand: 'Not)A;Brand', version: '24' }
  ],
  mobile: false,
  platform: 'Windows',
  highEntropyValues: {
    architecture: 'x86',
    bitness: '64',
    model: '',
    platformVersion: '19.0.0',
    uaFullVersion: '149.0.7827.201',
    fullVersionList: [
      { brand: 'Google Chrome', version: '149.0.7827.201' },
      { brand: 'Chromium', version: '149.0.7827.201' },
      { brand: 'Not)A;Brand', version: '24.0.0.0' }
    ],
    wow64: false
  }
});

function extractChromeVersionFromUserAgent(userAgent) {
  const match = String(userAgent || '').match(/\b(?:Chrome|Chromium|CriOS)\/([0-9]+(?:\.[0-9]+){0,3})\b/);
  if (!match) return null;
  const fullVersion = match[1];
  const major = fullVersion.split('.')[0];
  return major ? { major, fullVersion } : null;
}

function deriveNavigatorUADataFromUserAgent(userAgent) {
  const version = extractChromeVersionFromUserAgent(userAgent);
  if (!version) return null;
  const { major, fullVersion } = version;
  return {
    brands: [
      { brand: 'Google Chrome', version: major },
      { brand: 'Chromium', version: major },
      { brand: 'Not)A;Brand', version: '24' }
    ],
    highEntropyValues: {
      uaFullVersion: fullVersion,
      fullVersionList: [
        { brand: 'Google Chrome', version: fullVersion },
        { brand: 'Chromium', version: fullVersion },
        { brand: 'Not)A;Brand', version: '24.0.0.0' }
      ]
    }
  };
}

module.exports = {
  NAVIGATOR_UA_DATA_DEFAULTS,
  deriveNavigatorUADataFromUserAgent,
  extractChromeVersionFromUserAgent
};
