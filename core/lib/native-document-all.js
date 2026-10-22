const path = require('node:path');

const nativeModulePath = path.join(
  __dirname,
  '..',
  'native',
  'document-all',
  'build',
  'Release',
  'ivm-document-all-native.node'
);

function hasNativeDocumentAllModule() {
  const fs = require('node:fs');
  return fs.existsSync(nativeModulePath);
}

function loadNativeDocumentAllModule() {
  if (!hasNativeDocumentAllModule()) return null;
  try {
    return require(nativeModulePath);
  } catch {
    return null;
  }
}

async function installNativeDocumentAll(context) {
  if (!hasNativeDocumentAllModule()) {
    return false;
  }

  const ivm = require('isolated-vm');
  try {
    require(nativeModulePath);
  } catch {
    return false;
  }
  const nativeModule = new ivm.NativeModule(nativeModulePath);
  const moduleRef = await nativeModule.create(context);
  const global = context.global;

  await global.set('__documentAllNativeModule', moduleRef.derefInto());
  await context.eval(`
    __mini_browser__.installDocumentAllNative(__documentAllNativeModule);
    delete globalThis.__documentAllNativeModule;
  `, {
    timeout: 1000
  });

  moduleRef.release();
  return true;
}

function installNativeDocumentAllGlobal(target = globalThis) {
  const nativeModule = loadNativeDocumentAllModule();
  if (!nativeModule) return false;

  const miniBrowser = target && target.__mini_browser__;
  if (!miniBrowser || typeof miniBrowser.installDocumentAllNative !== 'function') {
    throw new TypeError('installNativeDocumentAllGlobal requires browser-env-source to be installed first.');
  }

  miniBrowser.installDocumentAllNative(nativeModule);
  return true;
}

module.exports = {
  installNativeDocumentAll,
  installNativeDocumentAllGlobal,
  hasNativeDocumentAllModule,
  loadNativeDocumentAllModule,
  nativeModulePath
};
