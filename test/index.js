const inflate = require('../');
const zlib = require('zlib');
const fs = require('fs');
const assert = require('assert');
const uncompressed = fs.readFileSync(__dirname + '/lorem.txt');

describe('tiny-inflate', function () {
  let compressed, noCompression, fixed;

  function deflate(buf, options, fn) {
    const chunks = [];
    zlib
      .createDeflateRaw(options)
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
    zlib.deflateRaw(uncompressed, function (err, data) {
      compressed = data;
      done();
    });
  });

  before(function (done) {
    deflate(
      uncompressed,
      { level: zlib.constants.Z_NO_COMPRESSION },
      function (err, data) {
        noCompression = data;
        done();
      }
    );
  });

  before(function (done) {
    deflate(
      uncompressed,
      { strategy: zlib.constants.Z_FIXED },
      function (err, data) {
        fixed = data;
        done();
      }
    );
  });

  it('should inflate some data', function () {
    let out = Buffer.alloc(uncompressed.length);
    inflate(compressed, out);
    assert.deepStrictEqual(out, uncompressed);
  });

  it('should slice output buffer', function () {
    let out = Buffer.alloc(uncompressed.length + 1024);
    let res = inflate(compressed, out);
    assert.deepStrictEqual(res, uncompressed);
    assert.strictEqual(res.length, uncompressed.length);
  });

  it('should handle uncompressed blocks', function () {
    let out = Buffer.alloc(uncompressed.length);
    inflate(noCompression, out);
    assert.deepStrictEqual(out, uncompressed);
  });

  it('should handle fixed huffman blocks', function () {
    let out = Buffer.alloc(uncompressed.length);
    inflate(fixed, out);
    assert.deepStrictEqual(out, uncompressed);
  });

  it('should handle typed arrays', function () {
    let input = new Uint8Array(compressed);
    let out = new Uint8Array(uncompressed.length);
    inflate(input, out);
    assert.deepStrictEqual(out, new Uint8Array(uncompressed));
  });
});
