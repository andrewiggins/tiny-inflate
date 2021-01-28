import gunzip from '../gunzip.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { test } from 'uvu';
import { deepStrictEqual, strictEqual } from 'assert';
import { formatMetadata } from '../log.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} path
 */
function readFixture(path) {
  return readFileSync(__dirname + path, 'utf8').replace(/\r\n/g, '\n');
}

test('should handle simple input', () => {
  let input = readFileSync(__dirname + '/simple/simple.txt.gz');
  let expectedOut = readFixture('/simple/simple.txt');
  let expectedMeta = readFixture('/simple/metadata.txt');

  let out = Buffer.alloc(expectedOut.length);
  let { metadata } = gunzip(input, out);

  deepStrictEqual(out.toString('utf8'), expectedOut);
  deepStrictEqual(formatMetadata(metadata), expectedMeta);
});

test('should handle SVG inputs', () => {
  let input = readFileSync(__dirname + '/svg-1-original/image.svg.gz');
  let expectedOut = readFixture('/svg-1-original/image.svg');
  let expectedMeta = readFixture('/svg-1-original/metadata.txt');

  let out = Buffer.alloc(expectedOut.length);
  let { metadata } = gunzip(input, out);

  deepStrictEqual(out.toString('utf8'), expectedOut);
  deepStrictEqual(formatMetadata(metadata), expectedMeta);
});

test('should handle well optimized SVG inputs', () => {
  let input = readFileSync(__dirname + '/svg-7-hex/image.svg.gz');
  let expectedOut = readFixture('/svg-7-hex/image.svg');
  let expectedMeta = readFixture('/svg-7-hex/metadata.txt');

  let out = Buffer.alloc(expectedOut.length);
  let { metadata } = gunzip(input, out);

  deepStrictEqual(out.toString('utf8'), expectedOut);
  deepStrictEqual(formatMetadata(metadata), expectedMeta);
});

test.run();
