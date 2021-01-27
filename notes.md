# Notes

Deflate uses the following compression mechanisms:

1. LZ77 compression
2. Huffman tree/codes
3. run length encoding

## Terminology

Trying to be consistent with the terminology I use for various parts of this algorithm. Here is what I think I've done:

<dl>
<dt>Code</dt>
<dd>A huffman code. A shortened representation (usually a couple of bits) of a symbol from the original uncompressed input.</dd>

<dt>Tree</dt>
<dd>The data structure used to read bits and turn huffman codes into a their original symbols.</dd>

<dt>Symbol</dt>
<dd>A single member of an alphabet a Huffman tree encodes. Translating a huffman code into its uncompressed form turns an huffman code into a symbol</dd>

<dt>Bit length</dt>
<dd><em>Consider renaming to bit count to differentiate between the LZ77 length</em></dd>
<dd><em>Consider renaming to Huffman code big length.</em></dd>
<dd>How many bits a huffman code is</dd>

<dt>Length</dt>
<dd><em>Consider renaming to LZ77 length.</em></dd>
<dd>In an LZ77 back reference, the number of symbols/bytes to copy.</dd>

<dt>Distance</dt>
<dd><em>Consider renaming to LZ77 distance.</em></dd>
<dd>In an LZ77 back reference, how far back in the output buffer the back reference begins. The copy starts there.</dd>

</dl>

## LZ77 compression

> TODO:
>
> - Use a better example
> - Ensure the distance, length ordering presented here matches the order Deflate represents them

Compresses files by encoding repeat sequences as references (or back pointers) to previous sequences in the text. References are pairs of how far back the reference begins and the length of reference, often referred to as (distance, length).

Original:

> In the beginning God created the heaven and the earth. And the earth was without form, and void

Encoded:

> In the beginning God created<25, 5>heaven an<14, 6>earth. A<14, 12> was without form,<48, 5>void;

## Huffman codes

Huffman codes (or huffman trees) are used to unambiguously encode data (e.g. words) into the fewest variable length bits as possible. Variable length is important cuz it allows very common symbols (e.g. " ") to be encoded using very few bytes (e.g. `000`) while more uncommon symbols (e.g. `Z`) can be represented using longer bit sequences (`111111`). Being unambiguous is is important. Take for example this table:

| Symbol | Code | Bit length |
| ------ | ---- | ---------- |
| a      | 000  | 3          |
| b      | 0001 | 4          |
| c      | 1000 | 4          |

With the sample input `0001000` it is impossible to tell if this is suppose to be `ac` (`000 1000`) or `ba` (`0001 000`). Using Huffman ensures that more common symbols are represented using as few byes as possible while still be distinct from the longer bit patterns for less frequent symbols.

DEFLATE has two rules on the huffman codes it parses that allow for very small representation of the trees.

- All codes of a given bit length have lexicographically consecutive values, in the same order as the symbols they represent.
- Shorter codes lexicographically precede longer codes.

For example, take this huffman code table arranged in the order of the symbols of the alphabet `ABCD`:

| Symbol | Code | Bit length |
| ------ | ---- | ---------- |
| A      | 10   | 2          |
| B      | 0    | 1          |
| C      | 110  | 3          |
| D      | 111  | 3          |

Here, the first rule is followed because the two codes with the same bit length (`110` & `111`) are in lexicographical order. The second rule is followed because even though `0` is after `10` in the order of the alphabet, it lexicographically precedes all the longer codes in the table. The codes sorted lexicographically is `['0', '10', '110', '111']`.

Knowing these two rules and the alphabet we want to encode, we can represent the huffman table by just specifying the bit lengths of the codes. So using the example above, knowing the alphabet is `ABCD` and the bit lengths in order are `[2, 1, 3, 3]`, we can know that the code for the first bit length of `3` is the shortest code of 3 bits and the second code of length `3` is the next lexicographical code of length 3.

Another example: with the alphabet `ABCDEFGH` and huffman code bit lengths of `[3, 3, 3, 3, 3, 2, 4, 4]`, we can generate the following table:

| Symbol | Code | Bit length |
| ------ | ---- | ---------- |
| A      | 010  | 3          |
| B      | 011  | 3          |
| C      | 100  | 3          |
| D      | 101  | 3          |
| E      | 110  | 3          |
| F      | 00   | 2          |
| G      | 1110 | 4          |
| H      | 1111 | 4          |

See [section 3.2.2 of the Deflate RFC](https://tools.ietf.org/html/rfc1951#section-3.2.2) for the algorithm on turning the alphabet and bit lengths into the actual huffman codes.

## Deflate: Combining Huffman codes and LZ77

Deflate explicitly defines the alphabet its huffman codes use:

- Bytes 0-255 represent literal values (so for an ascii encoded text file bytes 97-122 are the letters a-z)
- Byte 256 signals the end of this block of compressed data
- Bytes 257-285 signal the start of a LZ77 `(length, distance)` reference pair

We'll refer to the values represented by the alphabet Deflate compresses as symbols.

To be able to represent lengths and distances greater than 29 (the number of symbols between 257-285), each symbol is associated with a number of "extra" bits to read so more lengths can be represented. The following table shows the number of extra bits each symbol can have and the lengths they can represent.

| Symbol | # of Extra Bits | Length(s) |
| ------ | --------------- | --------- |
| 257    | 0               | 3         |
| 258    | 0               | 4         |
| 259    | 0               | 5         |
| 260    | 0               | 6         |
| 261    | 0               | 7         |
| 262    | 0               | 8         |
| 263    | 0               | 9         |
| 264    | 0               | 10        |
| 265    | 1               | 11,12     |
| 266    | 1               | 13,14     |
| 267    | 1               | 15,16     |
| 268    | 1               | 17,18     |
| 269    | 2               | 19-22     |
| 270    | 2               | 23-26     |
| 271    | 2               | 27-30     |
| 272    | 2               | 31-34     |
| 273    | 3               | 35-42     |
| 274    | 3               | 43-50     |
| 275    | 3               | 51-58     |
| 276    | 3               | 59-66     |
| 277    | 4               | 67-82     |
| 278    | 4               | 83-98     |
| 279    | 4               | 99-114    |
| 280    | 4               | 115-130   |
| 281    | 5               | 131-162   |
| 282    | 5               | 163-194   |
| 283    | 5               | 195-226   |
| 284    | 5               | 227-257   |
| 285    | 0               | 258       |

Note, the lengths represented start at 3 because it doesn't make sense to LZ77 compress lengths less than 3 - it would better to just output the literal symbol. The extra bits are interpreted as an integer and added the the base length that symbol represents (the "base" length meaning the lowest length that symbol can represent).

Distances are similarly encoded. After reading a length symbol, another symbol (this time using different huffman codes but we'll get to that later) is read to represent the distance part of the LZ77 back reference pair. The following table represents the how distance extra bits work:

| Symbol | # of Extra Bits | Distance(s) |
| ------ | --------------- | ----------- |
| 0      | 0               | 1           |
| 1      | 0               | 2           |
| 2      | 0               | 3           |
| 3      | 0               | 4           |
| 4      | 1               | 5,6         |
| 5      | 1               | 7,8         |
| 6      | 2               | 9-12        |
| 7      | 2               | 13-16       |
| 8      | 3               | 17-24       |
| 9      | 3               | 25-32       |
| 10     | 4               | 33-48       |
| 11     | 4               | 49-64       |
| 12     | 5               | 65-96       |
| 13     | 5               | 97-128      |
| 14     | 6               | 129-192     |
| 15     | 6               | 193-256     |
| 16     | 7               | 257-384     |
| 17     | 7               | 385-512     |
| 18     | 8               | 513-768     |
| 19     | 8               | 769-1024    |
| 20     | 9               | 1025-1536   |
| 21     | 9               | 1537-2048   |
| 22     | 10              | 2049-3072   |
| 23     | 10              | 3073-4096   |
| 24     | 11              | 4097-6144   |
| 25     | 11              | 6145-8192   |
| 26     | 12              | 8193-12288  |
| 27     | 12              | 12289-16384 |
| 28     | 13              | 16385-24576 |
| 29     | 13              | 24577-32768 |

## Summary so far

This is lot! So let's review what we have so far and how it might fit together if this is where Deflate stopped (note - Deflate has some additional compressions discussed below so what we describe, while a form of compression isn't yet Deflate)

If we were to put this into a compressed file it might look something like the following. We need 3 pieces of information

1. Huffman code bit lengths for the literal/length alphabet (bytes 0-285)
2. Huffman code bit lengths for the distance alphabet (symbols 0-29)
3. The actual Huffman encoded data

Given those three things our algorithm might look something like this:

**TODO: verify**

1. Read and build huffman tree for the literal/length symbols
2. Read and build the huffman tree for the distance symbols
3. Use the literal/length huffman tree to read huffman codes from the raw data
   1. Convert the huffman code to the literal/length symbol using the tree
   2. If the symbol < 256, output the symbol to the destination buffer. It's a literal byte from the input
   3. If symbol == 256, we are done! stop.
   4. If symbol > 256
      1. Compute the LZ77 length for this symbol using the extra bit length table
      2. Read a huffman code using the distance huffman tree and convert it to its original symbol.
      3. Compute the LZ77 distance for the distance symbol using the extra bit distance table.
      4. Go back in the destination buffer "distance" times and copy "length" bytes to the end of the destination buffer

A sample file might look something like the following.

literal/length huffman bit lengths (285 bit lengths):

```
0 0 0 ... 0 2 5 1
```

distance huffman bit lengths (30 bit lengths):

```
0 0 0 ... 0 2 5 1
```

raw huffman data:

```
001 010 1110 11111 010101
```

## Huffman coding the Huffman codes (with a dash of run-length encoding?)

**TODO**

It's huffmans all the way down!!!

Since there are likely to be a lot of zeros in the huffman bit lengths, Deflate huffman encodes those bit length declarations. The encoding it uses here is a combination of run length encoding + huffman encoding.

First it run length encodes the bit lengths.

| value | meaning                                                                              |
| ----- | ------------------------------------------------------------------------------------ |
| 0-15  | literal bit length for that symbol in the alphabet                                   |
| 16    | Copy the previous bit length 3 -6 times. The next two bits indicate the repeat count |
| 17    | Repeat bit code length of `0` 3 - 10 times. Reads next 3 bits for repeat count       |
| 18    | Repeat bit code length of `0` 11 - 138 times. Reads next 7 bits for repeat count     |

Then it huffman encodes the resulting run length encoded huffman bit lengths using a hard coded alphabet for each of the possible values that appear in the run length encoded bit lengths. The symbols for this alphabet in order are below:

```
16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15
```

The huffman bit lengths for this tree here are fixed at 3 bits. So to build the huffman tree, just read the 3 bits to get the bit length of the symbols above.

Using that (**What to call this 3rd huffman bit length tree**) huffman tree, you can parse the run length encoded bit length huffman codes for the literal/length huffman bit lengths and the distance huffman bit lengths.

## To read

- [GZThermal page](https://encode.su/threads/1889-gzthermal-pseudo-thermal-view-of-Gzip-Deflate-compression-efficiency)
- [Visualizing unzipping](https://jvns.ca/blog/2013/10/24/day-16-gzip-plus-poetry-equals-awesome/)
- [Dissecting the GZIP format](http://www.infinitepartitions.com/art001.html)
- [Another JS implementation (with Gzip support)](https://github.com/101arrowz/fflate)
  - [Description of the above library](https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad)
- [IETF RFC 1951 (Deflate)](https://www.ietf.org/rfc/rfc1951.txt)
- [IETF RFC 1952 (Gzip file format)](https://tools.ietf.org/rfc/rfc1952.html)

## Relevant fflate source links

- [gunzipSync](https://github.com/101arrowz/fflate/blob/8cd81460b67bb2c92c6549ea51ca7bbb2c8c9869/src/index.ts#L1529)
- [gzs (Gzip Start - header info)](https://github.com/101arrowz/fflate/blob/8cd81460b67bb2c92c6549ea51ca7bbb2c8c9869/src/index.ts#L1003)
- [gzl (Gzip length - data length from header)](https://github.com/101arrowz/fflate/blob/8cd81460b67bb2c92c6549ea51ca7bbb2c8c9869/src/index.ts#L1013)
