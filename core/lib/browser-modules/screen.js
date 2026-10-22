'use strict';

const SCREEN_DEFAULTS = Object.freeze({
  width: 1707,
  height: 1067,
  availWidth: 1707,
  availHeight: 1019,
  availLeft: 0,
  availTop: 0,
  colorDepth: 32,
  pixelDepth: 32,
  isExtended: false
});

const SCREEN_ORIENTATION_DEFAULTS = Object.freeze({
  angle: 0,
  type: 'landscape-primary'
});

function buildScreenDefaults(overrides = {}) {
  return Object.assign({}, SCREEN_DEFAULTS, overrides || {});
}

module.exports = {
  SCREEN_DEFAULTS,
  SCREEN_ORIENTATION_DEFAULTS,
  buildScreenDefaults
};
