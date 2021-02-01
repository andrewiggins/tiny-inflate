// - TODO: Remove loc property
// - TODO: Replace rawValue type with BitsRead type
// - TODO: Extend BitsREad with a value prop to represent what the decoded bytes
//   mean

type CodeLengthCategory =
  | 'run_length_table'
  | 'lz77_length_table'
  | 'lz77_dist_table';

interface BitLocation {
  index: number;
  length: number;
}

interface BitsRead {
  bits: number;
  length: number;
}

interface BasicBitInfo {
  type:
    | 'bfinal'
    | 'btype'
    | 'hlit'
    | 'hdist'
    | 'hclen'
    | 'literal'
    | 'block_end';
  /** Raw value from bit stream */
  rawValue: number;
  /** Computed meaningful value for Deflate algorithm */
  value: number;
  loc: BitLocation;
}

interface LZ77Value {
  /** The computed value used in the LZ77 back reference */
  value: number;
  /** The decoded symbol that started this LZ77 value */
  symbol: number;
  /** The encoded bits that map to the the defined symbol */
  rawSymbol: BitsRead;
  /** The extra bits associated  */
  extraBits: BitsRead;
}

interface LZ77BitInfo {
  type: 'lz77';
  loc: BitLocation;
  values: number[];
  length: LZ77Value;
  dist: LZ77Value;
}

interface HuffmanCodeLengths {
  type: 'code_length';
  loc: BitLocation;
  category: CodeLengthCategory;
  /** Huffman encoded code length */
  rawValue: number;
  /** The symbol this code length represents */
  symbol: number;
  /** The decoded code length these bits represent */
  huffmanCodeLength: number;
}

interface RepeatHuffmanCodeLengths {
  type: 'repeat_code_length';
  loc: BitLocation;
  category: CodeLengthCategory;
  /** The raw bits that signaled this repeat code */
  rawSymbol: BitsRead;
  /** The bits read to signal how long to repeat this code length */
  rawRepeatCount: BitsRead;
  /** The decoded symbol that represents what kind of repeat this is (16, 17, or 18) */
  symbol: number;
  /** The decoded count to repeat this code length */
  repeatCount: number;
  /** The decoded huffman code length to repeat */
  huffmanCodeLength: number;
  /** The symbols this repeated huffman code length applies to */
  symbols: number[];
}

interface GzipHeader {
  type: 'gzip_header';
  loc: BitLocation;
  rawValue: Uint8Array;
}

interface GzipFooter {
  type: 'gzip_footer';
  loc: BitLocation;
  rawValue: Uint8Array;
}

type BitInfo =
  | BasicBitInfo
  | LZ77BitInfo
  | HuffmanCodeLengths
  | RepeatHuffmanCodeLengths
  | GzipHeader
  | GzipFooter;

type BitInfoType = BitInfo['type'];

type Metadata = BitInfo[];
