import inflate from '../index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createDeflateRaw, deflateRaw, constants } from 'zlib';
import { readFileSync } from 'fs';
import { deepStrictEqual, strictEqual } from 'assert';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uncompressed = readFileSync(__dirname + '/lorem.txt');

describe('tiny-inflate', function () {
  let compressed, noCompression, fixed;

  function deflate(buf, options, fn) {
    const chunks = [];
    createDeflateRaw(options)
      .on('data', function (chunk) {
        chunks.push(chunk);
      })
      .on('error', fn)
      .on('end', function () {
        fn(null, Buffer.concat(chunks));
      })
      .end(buf);
  }

  before(function (done) {
    deflateRaw(uncompressed, function (err, data) {
      compressed = data;
      done();
    });
  });

  before(function (done) {
    deflate(
      uncompressed,
      { level: constants.Z_NO_COMPRESSION },
      function (err, data) {
        noCompression = data;
        done();
      }
    );
  });

  before(function (done) {
    deflate(
      uncompressed,
      { strategy: constants.Z_FIXED },
      function (err, data) {
        fixed = data;
        done();
      }
    );
  });

  it('should inflate some data', function () {
    let out = Buffer.alloc(uncompressed.length);
    inflate(compressed, out);
    deepStrictEqual(out, uncompressed);
  });

  it('should slice output buffer', function () {
    let out = Buffer.alloc(uncompressed.length + 1024);
    let res = inflate(compressed, out);
    deepStrictEqual(res, uncompressed);
    strictEqual(res.length, uncompressed.length);
  });

  it('should handle uncompressed blocks', function () {
    let out = Buffer.alloc(uncompressed.length);
    inflate(noCompression, out);
    deepStrictEqual(out, uncompressed);
  });

  it('should handle fixed huffman blocks', function () {
    let out = Buffer.alloc(uncompressed.length);
    inflate(fixed, out);
    deepStrictEqual(out, uncompressed);
  });

  it('should handle typed arrays', function () {
    let input = new Uint8Array(compressed);
    let out = new Uint8Array(uncompressed.length);
    inflate(input, out);
    deepStrictEqual(out, new Uint8Array(uncompressed));
  });
});
