'use strict';

const DEFAULT_STORAGE_QUOTA_BYTES = 5 * 1024 * 1024;

const STORAGE_DEFAULTS = Object.freeze({
  localStorage: Object.freeze({
    disabled: false,
    quotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
    entries: Object.freeze({})
  }),
  sessionStorage: Object.freeze({
    disabled: false,
    quotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
    entries: Object.freeze({})
  })
});

function buildStorageDefaults(overrides = {}) {
  const localStorage = Object.assign({}, STORAGE_DEFAULTS.localStorage, overrides.localStorage || {});
  const sessionStorage = Object.assign({}, STORAGE_DEFAULTS.sessionStorage, overrides.sessionStorage || {});
  return { localStorage, sessionStorage };
}

module.exports = {
  DEFAULT_STORAGE_QUOTA_BYTES,
  STORAGE_DEFAULTS,
  buildStorageDefaults
};
