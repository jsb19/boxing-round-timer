#!/usr/bin/env python3
"""Generate solid-color square PNG icons for the PWA manifest.

Uses only the Python standard library (struct, zlib) so no image
library needs to be installed.
"""
import struct
import zlib
import pathlib

COLOR = (192, 57, 43)  # #c0392b, matches the app's theme color


def make_png(size, path):
    width = height = size
    row = bytes([0]) + bytes(COLOR) * width  # filter-type byte 0 + RGB per pixel
    raw = row * height
    compressed = zlib.compress(raw, 9)

    def chunk(tag, data):
        return (
            struct.pack('>I', len(data))
            + tag
            + data
            + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
        )

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit truecolor
    png = sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    path.write_bytes(png)


if __name__ == '__main__':
    out_dir = pathlib.Path(__file__).parent
    make_png(192, out_dir / 'icon-192.png')
    make_png(512, out_dir / 'icon-512.png')
    print('Wrote icon-192.png and icon-512.png')
