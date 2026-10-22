'use strict';

const FILE_SYSTEM_DEFAULTS = Object.freeze({
  permission: 'granted',
  openFiles: Object.freeze([]),
  saveFile: Object.freeze({
    name: 'untitled.txt',
    type: 'text/plain',
    content: ''
  }),
  root: Object.freeze({
    name: '',
    kind: 'directory',
    entries: Object.freeze({})
  })
});

module.exports = {
  FILE_SYSTEM_DEFAULTS
};
