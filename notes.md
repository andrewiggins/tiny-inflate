# Notes

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
