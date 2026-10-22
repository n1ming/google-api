'use strict';

const SERVICE_WORKER_DEFAULTS = Object.freeze({
  controller: null,
  ready: Object.freeze({
    scope: '/',
    active: Object.freeze({
      scriptURL: '',
      state: 'activated'
    })
  }),
  registrations: [],
  register: Object.freeze({
    enabled: true
  })
});

const CREDENTIALS_DEFAULTS = Object.freeze({
  stored: null,
  create: null,
  get: null,
  store: null,
  preventSilentAccess: true
});

const LOCKS_DEFAULTS = Object.freeze({
  query: Object.freeze({
    held: [],
    pending: []
  })
});

const KEYBOARD_DEFAULTS = Object.freeze({
  layoutMap: Object.freeze({
    KeyK: 'k',
    KeyG: 'g',
    Digit2: '2',
    Digit0: '0',
    KeyV: 'v',
    KeyA: 'a',
    Backquote: '`',
    KeyL: 'l',
    IntlBackslash: '\\',
    Quote: "'",
    KeyW: 'w',
    Digit8: '8',
    KeyM: 'm',
    KeyH: 'h',
    Period: '.',
    Digit7: '7',
    Digit1: '1',
    KeyP: 'p',
    KeyD: 'd',
    KeyF: 'f',
    KeyO: 'o',
    KeyQ: 'q',
    KeyC: 'c',
    KeyN: 'n',
    BracketLeft: '[',
    KeyZ: 'z',
    KeyY: 'y',
    Digit3: '3',
    Digit6: '6',
    Digit5: '5',
    KeyX: 'x',
    Slash: '/',
    Backslash: '\\',
    Comma: ',',
    Minus: '-',
    Digit4: '4',
    KeyB: 'b',
    KeyT: 't',
    Digit9: '9',
    KeyS: 's',
    KeyI: 'i',
    KeyU: 'u',
    Equal: '=',
    KeyJ: 'j',
    Semicolon: ';',
    KeyR: 'r',
    BracketRight: ']',
    KeyE: 'e'
  })
});

const HID_DEFAULTS = Object.freeze({
  devices: []
});

const SERIAL_DEFAULTS = Object.freeze({
  ports: []
});

const USB_DEFAULTS = Object.freeze({
  devices: []
});

const BLUETOOTH_DEFAULTS = Object.freeze({
  available: false,
  devices: [],
  selectedDevice: null
});

const XR_DEFAULTS = Object.freeze({
  supportedSessions: [],
  enabledFeatures: [],
  selectedSession: null,
  environmentBlendMode: 'opaque',
  interactionMode: 'screen-space',
  visibilityState: 'visible'
});

module.exports = {
  SERVICE_WORKER_DEFAULTS,
  CREDENTIALS_DEFAULTS,
  LOCKS_DEFAULTS,
  KEYBOARD_DEFAULTS,
  HID_DEFAULTS,
  SERIAL_DEFAULTS,
  USB_DEFAULTS,
  BLUETOOTH_DEFAULTS,
  XR_DEFAULTS
};
