'use strict';

const ENCODING_DEFAULTS = Object.freeze({
  textDecoder: Object.freeze({
    encoding: 'utf-8',
    fatal: false,
    ignoreBOM: false
  })
});

module.exports = {
  ENCODING_DEFAULTS
};
