'use strict';

const GEOLOCATION_DEFAULTS = Object.freeze({
  coords: Object.freeze({
    latitude: 0,
    longitude: 0,
    accuracy: 1,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null
  }),
  timestamp: null,
  error: null
});

const CLIPBOARD_DEFAULTS = Object.freeze({
  text: '',
  items: Object.freeze([]),
  onclipboardchange: null
});

const COOKIE_STORE_DEFAULTS = Object.freeze({
  cookies: Object.freeze([]),
  onchange: null,
  subscriptions: Object.freeze([])
});

const BATTERY_DEFAULTS = Object.freeze({
  charging: true,
  chargingTime: Infinity,
  dischargingTime: Infinity,
  level: 0.99
});

const STORAGE_MANAGER_DEFAULTS = Object.freeze({
  usage: 0,
  quota: 10 * 1024 * 1024 * 1024,
  persisted: false,
  usageDetails: Object.freeze({})
});

module.exports = {
  GEOLOCATION_DEFAULTS,
  CLIPBOARD_DEFAULTS,
  COOKIE_STORE_DEFAULTS,
  BATTERY_DEFAULTS,
  STORAGE_MANAGER_DEFAULTS
};
