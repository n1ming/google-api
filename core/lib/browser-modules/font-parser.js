'use strict';

function parseFontNames(input, options = {}) {
  const bytes = toUint8Array(input);
  if (!bytes || bytes.length < 12) return [];

  const fonts = [];
  if (tagAt(bytes, 0) === 'ttcf' && bytes.length >= 12) {
    const count = readU32(bytes, 8);
    const limit = Math.min(count, Math.floor((bytes.length - 12) / 4));
    for (let index = 0; index < limit; index += 1) {
      const offset = readU32(bytes, 12 + index * 4);
      const parsed = parseSfntFont(bytes, offset, options);
      if (parsed) fonts.push(parsed);
    }
  } else {
    const parsed = parseSfntFont(bytes, 0, options);
    if (parsed) fonts.push(parsed);
  }

  const seen = new Set();
  return fonts.filter((font) => {
    const key = [
      font.family || '',
      font.fullName || '',
      font.postScriptName || ''
    ].join('\u0000');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toUint8Array(input) {
  if (input === undefined || input === null) return null;
  if (input instanceof Uint8Array) return input;
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof input === 'string') {
    const output = new Uint8Array(input.length);
    for (let index = 0; index < input.length; index += 1) {
      output[index] = input.charCodeAt(index) & 0xff;
    }
    return output;
  }
  if (Array.isArray(input)) return new Uint8Array(input.map((value) => Number(value) & 0xff));
  return null;
}

function parseSfntFont(bytes, offset, options) {
  if (!Number.isFinite(offset) || offset < 0 || offset + 12 > bytes.length) return null;
  const signature = tagAt(bytes, offset);
  if (signature === 'wOF2') return null;
  if (signature === 'wOFF') return parseWoffFont(bytes, offset, options);

  const scaler = readU32(bytes, offset);
  const valid = scaler === 0x00010000 ||
    signature === 'OTTO' ||
    signature === 'true' ||
    signature === 'typ1';
  if (!valid) return null;

  const table = findSfntTable(bytes, offset, 'name');
  if (!table) return null;
  return parseNameTable(bytes, table.offset, table.length);
}

function parseWoffFont(bytes, offset, options) {
  if (offset + 44 > bytes.length) return null;
  const numTables = readU16(bytes, offset + 12);
  const tableDirOffset = offset + 44;
  for (let index = 0; index < numTables; index += 1) {
    const recordOffset = tableDirOffset + index * 20;
    if (recordOffset + 20 > bytes.length) return null;
    if (tagAt(bytes, recordOffset) !== 'name') continue;

    const dataOffset = readU32(bytes, recordOffset + 4);
    const compLength = readU32(bytes, recordOffset + 8);
    const origLength = readU32(bytes, recordOffset + 12);
    if (dataOffset + compLength > bytes.length) return null;

    let tableBytes = bytes.subarray(dataOffset, dataOffset + compLength);
    if (compLength !== origLength) {
      if (!options || typeof options.inflate !== 'function') return null;
      tableBytes = toUint8Array(options.inflate(tableBytes));
      if (!tableBytes || tableBytes.length < origLength) return null;
    }
    return parseNameTable(tableBytes, 0, origLength);
  }
  return null;
}

function findSfntTable(bytes, offset, targetTag) {
  const numTables = readU16(bytes, offset + 4);
  for (let index = 0; index < numTables; index += 1) {
    const recordOffset = offset + 12 + index * 16;
    if (recordOffset + 16 > bytes.length) return null;
    if (tagAt(bytes, recordOffset) !== targetTag) continue;
    return {
      offset: offset + readU32(bytes, recordOffset + 8),
      length: readU32(bytes, recordOffset + 12)
    };
  }
  return null;
}

function parseNameTable(bytes, tableOffset, tableLength) {
  if (tableOffset + 6 > bytes.length) return null;
  const count = readU16(bytes, tableOffset + 2);
  const stringOffset = readU16(bytes, tableOffset + 4);
  const storageStart = tableOffset + stringOffset;
  const storageEnd = Math.min(bytes.length, tableOffset + tableLength);
  const records = [];

  for (let index = 0; index < count; index += 1) {
    const recordOffset = tableOffset + 6 + index * 12;
    if (recordOffset + 12 > bytes.length) break;
    const platformID = readU16(bytes, recordOffset);
    const encodingID = readU16(bytes, recordOffset + 2);
    const languageID = readU16(bytes, recordOffset + 4);
    const nameID = readU16(bytes, recordOffset + 6);
    const length = readU16(bytes, recordOffset + 8);
    const offset = readU16(bytes, recordOffset + 10);
    if (![1, 2, 4, 6, 16, 17].includes(nameID)) continue;
    const start = storageStart + offset;
    const end = start + length;
    if (start < storageStart || end > storageEnd) continue;
    const value = decodeNameRecord(bytes.subarray(start, end), platformID, encodingID);
    if (!value) continue;
    records.push({ platformID, languageID, nameID, value });
  }

  records.sort(nameRecordPriority);
  const names = {};
  for (const record of records) {
    if (names[record.nameID] === undefined) names[record.nameID] = record.value;
  }

  const family = names[16] || names[1] || '';
  const subfamily = names[17] || names[2] || '';
  const fullName = names[4] || [family, subfamily].filter(Boolean).join(' ');
  const postScriptName = names[6] || '';
  if (!family && !fullName && !postScriptName) return null;
  return {
    family,
    subfamily,
    fullName,
    postScriptName,
    names
  };
}

function decodeNameRecord(bytes, platformID, encodingID) {
  if (platformID === 0 || platformID === 3) return decodeUTF16BE(bytes);
  if (platformID === 1 && (encodingID === 0 || encodingID === 1)) return decodeLatin(bytes);
  return decodeLatin(bytes);
}

function decodeUTF16BE(bytes) {
  let output = '';
  for (let index = 0; index + 1 < bytes.length; index += 2) {
    const code = (bytes[index] << 8) | bytes[index + 1];
    if (code) output += String.fromCharCode(code);
  }
  return cleanName(output);
}

function decodeLatin(bytes) {
  let output = '';
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index]) output += String.fromCharCode(bytes[index]);
  }
  return cleanName(output);
}

function cleanName(value) {
  return String(value || '').replace(/\u0000/g, '').trim();
}

function nameRecordPriority(left, right) {
  return recordScore(left) - recordScore(right);
}

function recordScore(record) {
  if (record.platformID === 3 && record.languageID === 0x0409) return 0;
  if (record.platformID === 0) return 1;
  if (record.platformID === 3) return 2;
  if (record.platformID === 1) return 3;
  return 4;
}

function tagAt(bytes, offset) {
  if (offset + 4 > bytes.length) return '';
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function readU16(bytes, offset) {
  if (offset + 2 > bytes.length) return 0;
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readU32(bytes, offset) {
  if (offset + 4 > bytes.length) return 0;
  return ((bytes[offset] * 0x1000000) + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])) >>> 0;
}

module.exports = {
  parseFontNames
};
