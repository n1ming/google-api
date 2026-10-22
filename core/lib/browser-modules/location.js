'use strict';

const LOCATION_DEFAULTS = Object.freeze({
  href: 'https://example.com/'
});

function buildLocationDefaults(overrides = {}) {
  return Object.assign({}, LOCATION_DEFAULTS, overrides || {});
}

module.exports = {
  LOCATION_DEFAULTS,
  buildLocationDefaults
};
