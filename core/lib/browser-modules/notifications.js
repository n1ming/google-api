'use strict';

const NOTIFICATION_DEFAULTS = Object.freeze({
  permission: 'default',
  maxActions: 2,
  requestPermission: 'default'
});

const DEVICE_EVENT_DEFAULTS = Object.freeze({
  motion: Object.freeze({
    acceleration: Object.freeze({ x: null, y: null, z: null }),
    accelerationIncludingGravity: Object.freeze({ x: null, y: null, z: null }),
    rotationRate: Object.freeze({ alpha: null, beta: null, gamma: null }),
    interval: 0
  }),
  orientation: Object.freeze({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false
  })
});

module.exports = {
  NOTIFICATION_DEFAULTS,
  DEVICE_EVENT_DEFAULTS
};
