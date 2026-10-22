'use strict';

const PERMISSION_STATES = Object.freeze({
  accelerometer: 'granted',
  gyroscope: 'granted',
  magnetometer: 'granted',
  'ambient-light-sensor': 'granted',
  'background-fetch': 'granted',
  'background-sync': 'granted',
  midi: 'prompt',
  'clipboard-write': 'granted',
  'screen-wake-lock': 'granted',
  geolocation: 'prompt',
  notifications: 'prompt',
  push: 'prompt',
  camera: 'prompt',
  microphone: 'prompt',
  bluetooth: 'prompt',
  'persistent-storage': 'prompt',
  'clipboard-read': 'prompt',
  'idle-detection': 'prompt',
  nfc: 'prompt',
  'storage-access': 'granted',
  'window-management': 'prompt',
  'local-fonts': 'prompt',
  'payment-handler': 'granted',
  'display-capture': 'prompt',
  'periodic-background-sync': 'denied',
  'keyboard-lock': 'granted',
  'pointer-lock': 'granted'
});

const PERMISSION_ERRORS = Object.freeze({
  'ambient-light-sensor': Object.freeze({
    name: 'TypeError',
    message: "Failed to execute 'query' on 'Permissions': GenericSensorExtraClasses flag is not enabled.",
    stackMessage: 'GenericSensorExtraClasses flag is not enabled.'
  })
});

const PERMISSION_DEFAULTS = Object.freeze({
  defaultState: 'prompt',
  queryDelayMs: 0,
  validNames: Object.freeze(Object.keys(PERMISSION_STATES)),
  states: PERMISSION_STATES,
  errors: PERMISSION_ERRORS
});

module.exports = {
  PERMISSION_DEFAULTS
};
