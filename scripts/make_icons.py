#!/usr/bin/env python3
"""Generate app icons (no third-party deps) — a simple castle on purple."""
import struct, zlib, os, math

PURPLE = (91, 42, 134)
PURPLE_DK = (61, 28, 92)
WHITE = (255, 255, 255)
YELLOW = (255, 210, 63)
PINK = (255, 93, 162)
BLUE = (46, 197, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make(size, maskable=False):
    px = bytearray()
    cx = size / 2
    # padding for maskable safe zone
    pad = size * 0.12 if maskable else size * 0.0
    img = [[None] * size for _ in range(size)]

    def put(x, y, col):
        if 0 <= x < size and 0 <= y < size:
            img[y][x] = col

    def rect(x0, y0, x1, y1, col):
        for y in range(int(y0), int(y1)):
            for x in range(int(x0), int(x1)):
                put(x, y, col)

    def tri(x0, x1, ytop, ybase, col):
        # isosceles triangle, apex centered at top
        midx = (x0 + x1) / 2
        h = ybase - ytop
        for y in range(int(ytop), int(ybase)):
            t = (y - ytop) / h
            hw = (x1 - x0) / 2 * t
            for x in range(int(midx - hw), int(midx + hw) + 1):
                put(x, y, col)

    def disc(ccx, ccy, r, col):
        for y in range(int(ccy - r), int(ccy + r) + 1):
            for x in range(int(ccx - r), int(ccx + r) + 1):
                if (x - ccx) ** 2 + (y - ccy) ** 2 <= r * r:
                    put(x, y, col)

    def star(scx, scy, r, col):
        pts = []
        for i in range(10):
            ang = -math.pi / 2 + i * math.pi / 5
            rr = r if i % 2 == 0 else r * 0.45
            pts.append((scx + rr * math.cos(ang), scy + rr * math.sin(ang)))
        # scanline fill
        ys = [p[1] for p in pts]
        for y in range(int(min(ys)), int(max(ys)) + 1):
            xs = []
            for i in range(len(pts)):
                x1, y1 = pts[i]
                x2, y2 = pts[(i + 1) % len(pts)]
                if (y1 <= y < y2) or (y2 <= y < y1):
                    xs.append(x1 + (x2 - x1) * (y - y1) / (y2 - y1))
            xs.sort()
            for j in range(0, len(xs) - 1, 2):
                for x in range(int(xs[j]), int(xs[j + 1]) + 1):
                    put(x, y, col)

    s = size
    # castle geometry (within the non-padded area)
    base_y = s * 0.80
    # three towers
    tw = s * 0.16
    centers = [s * 0.30, s * 0.50, s * 0.70]
    heights = [s * 0.40, s * 0.30, s * 0.40]
    # main wall
    rect(s * 0.22, base_y - s * 0.22, s * 0.78, base_y, WHITE)
    for cxx, htop in zip(centers, heights):
        rect(cxx - tw / 2, htop, cxx + tw / 2, base_y, WHITE)
        # roof
        col = [PINK, BLUE, PINK][centers.index(cxx)]
        tri(cxx - tw / 2 - s * 0.01, cxx + tw / 2 + s * 0.01, htop - s * 0.10, htop + 1, col)
        # flag dot
        disc(cxx, htop - s * 0.12, s * 0.018, YELLOW)
    # door
    rect(s * 0.46, base_y - s * 0.14, s * 0.54, base_y, PURPLE_DK)
    # star in sky
    star(s * 0.50, s * 0.16, s * 0.07, YELLOW)

    # compose rows with vertical gradient background
    for y in range(size):
        t = y / size
        bg = lerp(lerp(PURPLE, (106, 58, 160), 0.0), PURPLE_DK, t)
        px.append(0)  # filter byte
        for x in range(size):
            col = img[y][x] if img[y][x] is not None else bg
            px += bytes(col)
    return encode_png(size, size, bytes(px))


def encode_png(w, h, rgb_rows_with_filter):
    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)
    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)  # 8-bit RGB
    idat = zlib.compress(rgb_rows_with_filter, 9)
    return sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "icons")
    os.makedirs(out, exist_ok=True)
    for size in (192, 512):
        with open(os.path.join(out, f"icon-{size}.png"), "wb") as f:
            f.write(make(size))
    with open(os.path.join(out, "icon-maskable-512.png"), "wb") as f:
        f.write(make(512, maskable=True))
    # favicon
    with open(os.path.join(out, "favicon.png"), "wb") as f:
        f.write(make(64))
    print("icons written")
