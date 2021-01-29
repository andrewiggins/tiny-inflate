/**
 * @param {Metadata} metadata
 */
export function logMetadata(metadata) {
  console.log(formatMetadata(metadata));
}

const lengthCodeLabels = [
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '[11-12]',
  '[13-14]',
  '[15-16]',
  '[17-18]',
  '[19-22]',
  '[23-26]',
  '[27-30]',
];

const distanceCodeLabels = [
  '1',
  '2',
  '3',
  '4',
  '[5-6]',
  '[7-8]',
  '[9-12]',
  '[13-16]',
  '[17-24]',
  '[25-32]',
  '[33-48]',
  '[49-64]',
  '[65-96]',
  '[97-128]',
  '[129-192]',
];

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

      case 'code_length': {
        out += log({
          size: info.loc.length,
          msg: getCodeLengthMessage(
            info.category,
            info.symbol,
            info.huffmanCodeLength
          ),
        });
        break;
      }
      case 'repeat_code_length': {
        let label = info.huffmanCodeLength == 0 ? 'ZREP' : 'LREP';
        out += log({
          size: info.loc.length,
          msg: `${label} (${info.repeatCount} times)`,
        });

        for (let symbol of info.symbols) {
          out += log({
            size: null,
            msg: getCodeLengthMessage(
              info.category,
              symbol,
              info.huffmanCodeLength
            ),
          });
        }

        break;
      }
      case 'literal': {
        let sym = info.value;
        out += log({
          size: info.loc.length,
          msg: `${toHex(sym)}  ${toChar(sym)}`,
        });
        break;
      }
      case 'lz77':
        out += log({
          size: info.loc.length,
          msg: `(${info.length.value},${info.dist.value})`,
        });
        break;

      case 'block_end':
        out += log({
          size: info.loc.length,
          msg: `EofB`,
        });
        break;
    }
  }

  return out;
}

/**
 * @param {{ size: number | null; msg: string; }} props
 */
export function log({ size, msg }) {
  if (size == null) {
    return ` [_] ${msg}\n`;
  } else if (size < 10) {
    return ` [${size}] ${msg}\n`;
  } else {
    return `[${size}] ${msg}\n`;
  }
}

/**
 * @param {CodeLengthCategory} category
 * @param {number} symbol
 * @param {number} huffmanCodeLength
 */
function getCodeLengthMessage(category, symbol, huffmanCodeLength) {
  let symbolLabel;
  if (category == 'run_length_table') {
    symbolLabel = symbol.toString(10).padStart(2);
  } else if (category == 'lz77_length_table') {
    if (symbol < 256) {
      symbolLabel = `0x${toHex(symbol)}`;
    } else if (symbol == 256) {
      symbolLabel = `EofB`;
    } else {
      symbolLabel = `l_${(symbol - 257).toString(10).padStart(2, '0')}`;
    }
  } else {
    symbolLabel = `d_${symbol.toString(10).padStart(2, '0')}`;
  }

  let suffix = '';
  if (category == 'lz77_length_table' && symbol > 256) {
    let index = symbol - 257;
    let label = 'length' + (index < 8 ? '' : 's');
    suffix = ` (${label} ${lengthCodeLabels[index]})`;
  } else if (category == 'lz77_dist_table') {
    let label = 'distance' + (symbol < 4 ? '' : 's');
    suffix = ` (${label} ${distanceCodeLabels[symbol]})`;
  }

  let cat = category == 'run_length_table' ? 'CLL' : 'CL';
  return `${symbolLabel} ${cat} (val: ${huffmanCodeLength})${suffix}`;
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
