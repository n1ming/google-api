'use strict';

const WINDOW_DEFAULTS = Object.freeze({
  name: '',
  status: '',
  origin: '',
  innerWidth: 1036,
  innerHeight: 905,
  outerWidth: 1050,
  outerHeight: 1000,
  screenLeft: 10,
  screenTop: 10,
  screenX: 10,
  screenY: 10,
  pageXOffset: 0,
  pageYOffset: 0,
  scrollX: 0,
  scrollY: 0,
  length: 0,
  devicePixelRatio: 1.5,
  closed: false,
  isSecureContext: true,
  crossOriginIsolated: false,
  originAgentCluster: true,
  credentialless: false
});

module.exports = {
  WINDOW_DEFAULTS
};
