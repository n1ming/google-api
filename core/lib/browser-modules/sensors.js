'use strict';

const SENSOR_DEFAULTS = Object.freeze({
  activated: false,
  hasReading: false,
  timestamp: null,
  accelerometer: Object.freeze({
    x: null,
    y: null,
    z: null,
    activated: false,
    hasReading: false,
    timestamp: null
  }),
  linearAccelerationSensor: Object.freeze({
    x: null,
    y: null,
    z: null,
    activated: false,
    hasReading: false,
    timestamp: null
  }),
  gravitySensor: Object.freeze({
    x: null,
    y: null,
    z: null,
    activated: false,
    hasReading: false,
    timestamp: null
  }),
  gyroscope: Object.freeze({
    x: null,
    y: null,
    z: null,
    activated: false,
    hasReading: false,
    timestamp: null
  }),
  absoluteOrientationSensor: Object.freeze({
    quaternion: null,
    activated: false,
    hasReading: false,
    timestamp: null
  }),
  relativeOrientationSensor: Object.freeze({
    quaternion: null,
    activated: false,
    hasReading: false,
    timestamp: null
  })
});

module.exports = {
  SENSOR_DEFAULTS
};
