import inflate from '../index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createDeflateRaw, deflateRaw, constants } from 'zlib';
import { readFileSync } from 'fs';
import { deepStrictEqual, strictEqual } from 'assert';
import { promisify } from 'util';
import { test } from 'uvu';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uncompressed = readFileSync(__dirname + '/lorem.txt');

/** @type {Buffer} */
let compressed;
/** @type {Buffer} */
let noCompression;
/** @type {Buffer} */
let fixed;

/**
 * @param {Buffer} buf
 * @param {import('zlib').ZlibOptions} options
 * @returns {Promise<Buffer>}
 */
function deflate(buf, options) {
  return new Promise((resolve, reject) => {
    /** @type {Uint8Array[]} */
    const chunks = [];
    createDeflateRaw(options)
      .on('data', (chunk) => {
        chunks.push(chunk);
      })
      .on('error', reject)
      .on('end', () => {
        resolve(Buffer.concat(chunks));
      })
      .end(buf);
  });
}

test.before(async () => {
  compressed = await promisify(deflateRaw)(uncompressed);
});

test.before(async () => {
  noCompression = await deflate(uncompressed, {
    level: constants.Z_NO_COMPRESSION,
  });
});

test.before(async () => {
  fixed = await deflate(uncompressed, { strategy: constants.Z_FIXED });
});

test('should inflate some data', () => {
  let out = Buffer.alloc(uncompressed.length);
  inflate(compressed, out);
  deepStrictEqual(out, uncompressed);
});

test('should slice output buffer', () => {
  let out = Buffer.alloc(uncompressed.length + 1024);
  let res = inflate(compressed, out);
  deepStrictEqual(res, uncompressed);
  strictEqual(res.length, uncompressed.length);
});

test('should handle uncompressed blocks', () => {
  let out = Buffer.alloc(uncompressed.length);
  inflate(noCompression, out);
  deepStrictEqual(out, uncompressed);
});

test('should handle fixed huffman blocks', () => {
  let out = Buffer.alloc(uncompressed.length);
  inflate(fixed, out);
  deepStrictEqual(out, uncompressed);
});

test('should handle typed arrays', () => {
  let input = new Uint8Array(compressed);
  let out = new Uint8Array(uncompressed.length);
  inflate(input, out);
  deepStrictEqual(out, new Uint8Array(uncompressed));
});

test('should handle simple input', () => {
  let input = readFileSync(__dirname + '/simple/simple.txt.deflate');
  let expectedOut = readFileSync(__dirname + '/simple/simple.txt', 'utf8');

  let out = Buffer.alloc(expectedOut.length);
  inflate(input, out);
  deepStrictEqual(out.toString('utf8'), expectedOut);
});

test.run();
