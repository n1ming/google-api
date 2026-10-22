'use strict';

const MEDIA_CAPABILITIES_DEFAULTS = Object.freeze({
  decodingInfo: {
    powerEfficient: true,
    smooth: true,
    supported: true,
    keySystemAccess: null
  },
  encodingInfo: {
    powerEfficient: true,
    smooth: true,
    supported: true
  }
});

const MEDIA_SESSION_DEFAULTS = Object.freeze({
  metadata: null,
  playbackState: 'none',
  positionState: null,
  cameraActive: false,
  microphoneActive: false
});

const MEDIA_METADATA_DEFAULTS = Object.freeze({
  title: '',
  artist: '',
  album: '',
  artwork: [],
  chapterInfo: []
});

module.exports = {
  MEDIA_CAPABILITIES_DEFAULTS,
  MEDIA_SESSION_DEFAULTS,
  MEDIA_METADATA_DEFAULTS
};
