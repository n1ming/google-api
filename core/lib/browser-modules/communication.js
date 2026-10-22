'use strict';

const COMMUNICATION_DEFAULTS = Object.freeze({
  webSocket: Object.freeze({
    readyState: 1,
    protocol: '',
    extensions: '',
    binaryType: 'blob',
    bufferedAmount: 0
  }),
  eventSource: Object.freeze({
    readyState: 1,
    withCredentials: false
  }),
  broadcastChannel: Object.freeze({}),
  messageChannel: Object.freeze({}),
  worker: Object.freeze({
    autoStart: true,
    defaultScript: '',
    reflectionOrderInContext: false
  }),
  sharedWorker: Object.freeze({
    autoStart: true,
    defaultScript: ''
  })
});

module.exports = {
  COMMUNICATION_DEFAULTS
};
