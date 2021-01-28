type BitInfoType =
  | 'bfinal'
  | 'btype'
  | 'hlit'
  | 'hdist'
  | 'hclen'
  | 'literal'
  | 'lz77'
  | 'block_end';

interface BitLocation {
  index: number;
  length: number;
}

interface BasicBitInfo {
  type: Exclude<BitInfoType, 'lz77'>;
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

type BitInfo = BasicBitInfo | LZ77BitInfo;

type Metadata = BitInfo[];
