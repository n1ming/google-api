'use strict';

const NETWORK_DEFAULTS = Object.freeze({
  defaultStatus: 200,
  defaultStatusText: 'OK',
  defaultHeaders: Object.freeze({
    'content-type': 'text/plain'
  }),
  defaultBody: '',
  resources: [],
  responses: []
});

const NETWORK_INFORMATION_DEFAULTS = Object.freeze({
  onchange: null,
  effectiveType: '4g',
  rtt: 100,
  downlink: 1.6,
  saveData: false
});

function buildNetworkDefaults(overrides = {}) {
  return Object.assign({}, NETWORK_DEFAULTS, overrides || {});
}

module.exports = {
  NETWORK_DEFAULTS,
  NETWORK_INFORMATION_DEFAULTS,
  buildNetworkDefaults
};
