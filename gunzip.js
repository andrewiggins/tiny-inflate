import inflate from './index.js';
import { uint8ToBitString } from './log.js';

// From https://github.com/101arrowz/fflate/blob/8cd81460b67bb2c92c6549ea51ca7bbb2c8c9869/src/index.ts#L1013

// gzip footer: -8 to -4 = CRC, -4 to -0 is length

// gzip start
/** @param {Uint8Array} d */
const gzs = (d) => {
  if (d[0] != 31 || d[1] != 139 || d[2] != 8) throw 'invalid gzip data';
  const flg = d[3];
  let st = 10;
  if (flg & 4) st += d[10] | ((d[11] << 8) + 2);
  for (let zs = ((flg >> 3) & 1) + ((flg >> 4) & 1); zs > 0; zs -= !d[st++]);
  return st + (flg & 2);
};

// gzip length
/** @param {Uint8Array} d */
const gzl = (d) => {
  const l = d.length;
  return (d[l - 4] | (d[l - 3] << 8) | (d[l - 2] << 16)) + 2 * (d[l - 1] << 23);
};

/** Expands GZIP data
 * @param {Uint8Array} data The data to decompress
 * @param {Uint8Array} out Where to write the data
 * @returns {{ result: Uint8Array, metadata: Metadata }} The decompressed version of the data
 */
export default function gunzip(data, out = new Uint8Array(gzl(data))) {
  const gzipDataStart = gzs(data);
  const gzipDataEnd = -8; // Gzip footer: -0 to -4 is length, -4 to -8 is CRC
  let { result, metadata } = inflate(
    data.subarray(gzipDataStart, gzipDataEnd),
    out
  );

  console.log(uint8ToBitString(data.subarray(0, gzipDataStart)));
  console.log(uint8ToBitString(data.subarray(gzipDataStart, gzipDataEnd)));
  console.log(uint8ToBitString(data.subarray(gzipDataEnd)));

  let lastIndex = 0;
  return {
    result,
    metadata: [
      {
        type: 'gzip_header',
        loc: { index: 0, length: gzipDataStart * 8 },
        rawValue: data.subarray(0, gzipDataStart),
      },
      ...metadata.map((d) => {
        lastIndex = d.loc.index + gzipDataStart * 8 + d.loc.length;
        return {
          ...d,
          loc: {
            index: d.loc.index + gzipDataStart * 8,
            length: d.loc.length,
          },
        };
      }),
      {
        type: 'gzip_footer',
        loc: { index: lastIndex, length: 8 * 8 },
        rawValue: data.subarray(gzipDataEnd),
      },
    ],
  };
}
