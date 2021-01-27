/**
 * @param {{ size: number; msg: string; }} props
 */
export function log({ size, msg }) {
  if (size < 10) {
    console.log(` [${size}] ${msg}`);
  } else {
    console.log(`[${size}] ${msg}`);
  }
}

/**
 * @param {number} num
 * @returns {string}
 */
export function toHex(num) {
  return num.toString(16).toUpperCase().padStart(2, '0');
}

/**
 * @param {number} num
 * @returns {string}
 */
export function toChar(num) {
  let ch = String.fromCharCode(num);
  if (/\s/.test(ch)) {
    return JSON.stringify(ch).slice(1, -1);
  } else {
    return ch;
  }
}
