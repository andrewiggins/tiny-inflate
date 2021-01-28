/**
 * @param {Metadata} metadata
 */
export function logMetadata(metadata) {
  console.log(formatMetadata(metadata));
}

/**
 * @param {Metadata} metadata
 */
export function formatMetadata(metadata) {
  let out = '';

  for (let info of metadata) {
    switch (info.type) {
      case 'bfinal':
        let bfinal = info.value;
        out += log({
          size: info.loc.length,
          msg:
            bfinal == 1
              ? `Last block (val: ${bfinal})`
              : `Not final (val: ${bfinal})`,
        });
        break;

      case 'btype':
        let btype = info.value;
        let msg =
          btype == 0
            ? `Uncompressed block (val: ${btype})`
            : btype == 1
            ? `Fixed Huffman Tree block (val: ${btype})`
            : `Dynamic Huffman Tree block (val: ${btype})`;

        out += log({ size: info.loc.length, msg });
        break;

      case 'hlit':
        let hlit = info.value;
        out += log({
          size: info.loc.length,
          msg: `HLIT  ${hlit.toString().padStart(3)} (val:${hlit - 257})`,
        });
        break;

      case 'hdist':
        let hdist = info.value;
        out += log({
          size: info.loc.length,
          msg: `HDIST ${hdist.toString().padStart(3)} (val:${hdist - 1})`,
        });
        break;

      case 'hclen':
        let hclen = info.value;
        out += log({
          size: info.loc.length,
          msg: `HCLEN ${hclen.toString().padStart(3)} (val:${hclen - 4})`,
        });
        break;

      case 'literal':
        let sym = info.value;
        out += log({
          size: info.loc.length,
          msg: `${toHex(sym)}  ${toChar(sym)}`,
        });
        break;

      case 'lz77':
        out += log({
          size: info.loc.length,
          msg: `(${info.length.value},${info.dist.value})`,
        });
        break;

      case 'block_end':
        out += log({
          size: info.loc.length,
          msg: `End of block (val: ${info.value})`,
        });
        break;
    }
  }

  return out;
}

/**
 * @param {{ size: number; msg: string; }} props
 */
export function log({ size, msg }) {
  if (size < 10) {
    return ` [${size}] ${msg}\n`;
  } else {
    return `[${size}] ${msg}\n`;
  }
}

/**
 * @param {number} num
 * @returns {string}
 */
function toHex(num) {
  return num.toString(16).toUpperCase().padStart(2, '0');
}

/**
 * @param {number} num
 * @returns {string}
 */
function toChar(num) {
  let ch = String.fromCharCode(num);
  if (/\s/.test(ch)) {
    return JSON.stringify(ch).slice(1, -1);
  } else {
    return ch;
  }
}
