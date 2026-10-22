'use strict';

const STREAMS_DEFAULTS = Object.freeze({
  readable: Object.freeze({
    highWaterMark: 1
  }),
  writable: Object.freeze({
    highWaterMark: 1
  }),
  transform: Object.freeze({
    highWaterMark: 1
  })
});

module.exports = {
  STREAMS_DEFAULTS
};
