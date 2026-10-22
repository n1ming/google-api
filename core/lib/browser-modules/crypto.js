'use strict';

const CRYPTO_DEFAULTS = Object.freeze({
  disabled: false,
  uuid: null,
  randomValues: null
});

function buildCryptoDefaults(overrides = {}) {
  return Object.assign({}, CRYPTO_DEFAULTS, overrides || {});
}

module.exports = {
  CRYPTO_DEFAULTS,
  buildCryptoDefaults
};
