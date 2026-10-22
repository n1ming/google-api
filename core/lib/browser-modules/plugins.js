'use strict';

const PDF_MIME_TYPES = Object.freeze([
  Object.freeze({
    type: 'application/pdf',
    suffixes: 'pdf',
    description: 'Portable Document Format'
  }),
  Object.freeze({
    type: 'text/pdf',
    suffixes: 'pdf',
    description: 'Portable Document Format'
  })
]);

const DEFAULT_NAVIGATOR_PLUGINS = Object.freeze([
  'PDF Viewer',
  'Chrome PDF Viewer',
  'Chromium PDF Viewer',
  'Microsoft Edge PDF Viewer',
  'WebKit built-in PDF'
].map((name) => Object.freeze({
  name,
  filename: 'internal-pdf-viewer',
  description: 'Portable Document Format',
  mimeTypes: PDF_MIME_TYPES
})));

module.exports = {
  DEFAULT_NAVIGATOR_PLUGINS
};
