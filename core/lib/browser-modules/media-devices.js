'use strict';

const MEDIA_DEVICE_SUPPORTED_CONSTRAINTS = Object.freeze({
  aspectRatio: true,
  autoGainControl: true,
  brightness: true,
  channelCount: true,
  colorTemperature: true,
  contrast: true,
  deviceId: true,
  displaySurface: true,
  echoCancellation: true,
  exposureCompensation: true,
  exposureMode: true,
  exposureTime: true,
  facingMode: true,
  focusDistance: true,
  focusMode: true,
  frameRate: true,
  groupId: true,
  height: true,
  iso: true,
  latency: true,
  noiseSuppression: true,
  pan: true,
  pointsOfInterest: true,
  resizeMode: true,
  restrictOwnAudio: true,
  sampleRate: true,
  sampleSize: true,
  saturation: true,
  sharpness: true,
  suppressLocalAudioPlayback: true,
  tilt: true,
  torch: true,
  voiceIsolation: true,
  whiteBalanceMode: true,
  width: true,
  zoom: true
});

const DEFAULT_MEDIA_DEVICES = Object.freeze([
  Object.freeze({
    deviceId: '',
    kind: 'audioinput',
    label: '',
    groupId: ''
  }),
  Object.freeze({
    deviceId: '',
    kind: 'videoinput',
    label: '',
    groupId: ''
  }),
  Object.freeze({
    deviceId: '',
    kind: 'audiooutput',
    label: '',
    groupId: ''
  })
]);

const MEDIA_DEVICES_DEFAULTS = Object.freeze({
  devices: DEFAULT_MEDIA_DEVICES,
  enumerateDevicesDelayMs: 0,
  supportedConstraints: MEDIA_DEVICE_SUPPORTED_CONSTRAINTS,
  getUserMedia: {
    enabled: false,
    errorName: 'NotAllowedError',
    errorMessage: 'Permission denied'
  },
  getDisplayMedia: {
    enabled: false,
    errorName: 'NotAllowedError',
    errorMessage: 'Permission denied'
  }
});

module.exports = {
  DEFAULT_MEDIA_DEVICES,
  MEDIA_DEVICE_SUPPORTED_CONSTRAINTS,
  MEDIA_DEVICES_DEFAULTS
};
