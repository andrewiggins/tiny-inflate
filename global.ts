// TODO: rawValue & bits

type BitInfoType =
  | 'bfinal'
  | 'btype'
  | 'hlit'
  | 'hdist'
  | 'hclen'
  | 'literal'
  | 'lz77'
  | 'block_end'
  | 'code_length'
  | 'repeat_code_length';

type CodeLengthCategory =
  | 'run_length_table'
  | 'lz77_length_table'
  | 'lz77_dist_table';

interface BitLocation {
  index: number;
  length: number;
}

interface BasicBitInfo {
  type: Exclude<BitInfoType, 'lz77' | 'code_length' | 'repeat_code_length'>;
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
  rawSymbol: number;
  /** The extra bits associated  */
  extraBits: number;
}

interface LZ77BitInfo {
  type: 'lz77';
  loc: BitLocation;
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
  /** The raw bits that represent this repeat code */
  rawValue: number;
  /** The decoded count to repeat this code length */
  repeatCount: number;
  /** The decoded huffman code length to repeat */
  huffmanCodeLength: number;
  /** The symbols this repeated huffman code length applies to */
  symbols: number[];
}

type BitInfo =
  | BasicBitInfo
  | LZ77BitInfo
  | HuffmanCodeLengths
  | RepeatHuffmanCodeLengths;

type Metadata = BitInfo[];
