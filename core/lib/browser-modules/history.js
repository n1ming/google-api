'use strict';

const HISTORY_DEFAULTS = Object.freeze({
  length: 2,
  state: null,
  scrollRestoration: 'auto'
});

function buildHistoryDefaults(overrides = {}) {
  return Object.assign({}, HISTORY_DEFAULTS, overrides || {});
}

module.exports = {
  HISTORY_DEFAULTS,
  buildHistoryDefaults
};
