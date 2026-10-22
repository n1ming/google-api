'use strict';

const MEDIA_DEFAULTS = Object.freeze({
  displayMode: 'browser',
  displayState: 'normal',
  prefersColorScheme: 'light',
  prefersContrast: 'no-preference',
  prefersReducedMotion: 'no-preference',
  prefersReducedData: 'no-preference',
  prefersReducedTransparency: 'no-preference',
  forcedColors: 'none',
  colorGamut: 'srgb',
  scripting: 'enabled',
  update: 'fast',
  overflowBlock: 'scroll',
  overflowInline: 'scroll',
  pointer: 'fine',
  hover: 'hover',
  anyPointer: 'fine',
  anyHover: 'hover',
  resizable: true,
  invertedColors: 'none',
  dynamicRange: 'standard',
  deviceSupportsHDR: false,
  devicePosture: 'continuous',
  color: 8,
  colorIndex: 0,
  monochrome: 0,
  grid: 0,
  scan: undefined,
  encryptedMedia: Object.freeze({
    enabled: true,
    supportedKeySystems: Object.freeze(['org.w3.clearkey']),
    errorName: 'NotSupportedError',
    errorMessage: 'The key system is not supported.',
    configuration: Object.freeze({
      initDataTypes: Object.freeze(['cenc', 'keyids', 'webm']),
      audioCapabilities: Object.freeze([]),
      videoCapabilities: Object.freeze([]),
      distinctiveIdentifier: 'not-allowed',
      persistentState: 'optional',
      sessionTypes: Object.freeze(['temporary'])
    })
  })
});

module.exports = {
  MEDIA_DEFAULTS
};
