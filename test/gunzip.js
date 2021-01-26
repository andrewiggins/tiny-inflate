import gunzip from '../gunzip.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { test } from 'uvu';
import { deepStrictEqual, strictEqual } from 'assert';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('should handle simple input', () => {
  let input = readFileSync(__dirname + '/simple.txt.gz');
  let expectedOut = readFileSync(__dirname + '/simple.txt', 'utf8');

  let out = Buffer.alloc(expectedOut.length);
  gunzip(input, out);

  deepStrictEqual(out.toString('utf8'), expectedOut);
});

test.run();
