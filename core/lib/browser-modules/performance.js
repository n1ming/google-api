'use strict';

const PERFORMANCE_DEFAULTS = Object.freeze({
  timeOrigin: null,
  navigation: {
    type: 0,
    redirectCount: 0
  },
  memory: {
    jsHeapSizeLimit: 4395630592,
    totalJSHeapSize: 1317728,
    usedJSHeapSize: 736132
  },
  timing: {},
  eventCounts: {},
  interactionCount: 0,
  resourceTimingBufferSize: 250,
  entries: [],
  resources: [],
  resourceEntries: [],
  marks: [],
  measures: [],
  navigationEntries: [],
  getEntriesByType: {}
});

function buildPerformanceDefaults(overrides = {}) {
  return Object.assign({}, PERFORMANCE_DEFAULTS, overrides || {});
}

module.exports = {
  PERFORMANCE_DEFAULTS,
  buildPerformanceDefaults
};
