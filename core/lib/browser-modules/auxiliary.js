'use strict';

const AUXILIARY_DEFAULTS = Object.freeze({
  scheduler: Object.freeze({
    inputPending: false,
    taskDelay: 0
  }),
  userActivation: Object.freeze({
    hasBeenActive: false,
    isActive: false
  }),
  wakeLock: Object.freeze({
    enabled: true,
    released: false,
    type: 'screen'
  }),
  virtualKeyboard: Object.freeze({
    overlaysContent: false,
    boundingRect: Object.freeze({ x: 0, y: 0, width: 0, height: 0 })
  }),
  windowControlsOverlay: Object.freeze({
    visible: false,
    titlebarAreaRect: Object.freeze({ x: 0, y: 0, width: 0, height: 0 })
  }),
  storageQuota: Object.freeze({
    usage: 0,
    quota: 10 * 1024 * 1024 * 1024
  }),
  launchQueue: Object.freeze({
    files: [],
    targetURL: ''
  })
});

module.exports = {
  AUXILIARY_DEFAULTS
};
