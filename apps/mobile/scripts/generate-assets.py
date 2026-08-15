#!/usr/bin/env python3
"""
Generate the app's icon, adaptive icon, splash and notification assets.

The mark is drawn programmatically rather than exported from a design tool so it
can be regenerated at any size and stays in sync with the brand tokens. Shapes
are rendered at 8x and downsampled with LANCZOS — PIL has no antialiasing on
primitives, so supersampling is what keeps the curves clean at icon sizes.

Run:  python3 scripts/generate-assets.py
"""

from PIL import Image, ImageDraw
import math
import pathlib

# Brand tokens — must match lib/theme.ts
MOSS = (23, 100, 63)          # primary
MOSS_DEEP = (11, 58, 36)      # darker ground for the icon
BONE = (251, 250, 247)        # background / foreground on dark
SEAL = (168, 118, 15)         # certification gold

SS = 8  # supersample factor

ASSETS = pathlib.Path(__file__).resolve().parent.parent / 'assets'


def _leaf(draw, cx, cy, size, fill, tilt=0.0):
    """
    A leaf as two mirrored quadratic arcs meeting at a point.

    Drawn as a filled polygon sampled along the curves; a font glyph or an
    ellipse both read as generic at 48px, whereas the pointed tip survives.
    """
    pts_a, pts_b = [], []
    steps = 60
    for i in range(steps + 1):
        t = i / steps
        # Outer edge: a bowed curve from base to tip.
        x = t * size
        y = -math.sin(t * math.pi) * size * 0.42
        pts_a.append((x, y))
        # Inner edge: a shallower mirror, giving the leaf its asymmetry.
        y2 = math.sin(t * math.pi) * size * 0.16
        pts_b.append((x, y2))

    poly = pts_a + list(reversed(pts_b))
    cos_t, sin_t = math.cos(tilt), math.sin(tilt)
    rotated = [
        (cx + px * cos_t - py * sin_t, cy + px * sin_t + py * cos_t)
        for px, py in poly
    ]
    draw.polygon(rotated, fill=fill)


def _mark(size, bg, ring, leaf, ring_gap=True, padding=0.18):
    """The Next360 mark: an open ring (the '360') enclosing a leaf."""
    canvas = size * SS
    img = Image.new('RGBA', (canvas, canvas), bg)
    draw = ImageDraw.Draw(img)

    cx = cy = canvas / 2
    radius = canvas * (0.5 - padding)
    stroke = canvas * 0.062

    if ring_gap:
        # Open at the top-right so the ring reads as motion, not a rubber stamp.
        draw.arc(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            start=310, end=250, fill=ring, width=int(stroke),
        )
    else:
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            outline=ring, width=int(stroke),
        )

    # The leaf sits wholly inside the ring with clear air around it. Sized past
    # ~0.95r it collides with the stroke and the mark turns into a blob at 48px.
    leaf_size = radius * 0.92
    tilt = -math.pi / 4  # tip up and to the right, echoing the ring's opening
    # Offset back along the leaf's own axis so the shape is optically centred
    # rather than centred on its bounding box.
    _leaf(
        draw,
        cx - math.cos(tilt) * leaf_size * 0.5,
        cy - math.sin(tilt) * leaf_size * 0.5,
        leaf_size,
        leaf,
        tilt=tilt,
    )

    return img.resize((size, size), Image.LANCZOS)


def write(img, name):
    path = ASSETS / name
    img.save(path, 'PNG', optimize=True)
    print(f'  {name:26} {img.size[0]}×{img.size[1]}')


def main():
    ASSETS.mkdir(exist_ok=True)
    print('Generating brand assets…')

    # iOS app icon — 1024², no alpha and no transparency (App Store rejects both).
    icon = _mark(1024, MOSS_DEEP + (255,), BONE + (255,), BONE + (255,))
    write(icon.convert('RGB'), 'icon.png')

    # Android adaptive foreground — the launcher masks and scales this, and it
    # also parallaxes, so the mark sits inside the 66% safe circle.
    adaptive = _mark(1024, (0, 0, 0, 0), BONE + (255,), BONE + (255,), padding=0.30)
    write(adaptive, 'adaptive-icon.png')

    # Notification icon — Android silhouettes this to pure white, so only the
    # alpha channel matters. Solid shapes, no ring gap (too fine at 96px).
    notif = _mark(96, (0, 0, 0, 0), (255, 255, 255, 255), (255, 255, 255, 255),
                  ring_gap=False, padding=0.16)
    write(notif, 'notification-icon.png')

    # Splash — a single centred mark on the brand ground. Expo scales this with
    # `contain`, so generous padding keeps it from touching the notch.
    splash_size = 1284
    splash = Image.new('RGB', (splash_size, splash_size), MOSS_DEEP)
    mark = _mark(int(splash_size * 0.34), (0, 0, 0, 0), BONE + (255,), BONE + (255,))
    splash.paste(mark, ((splash_size - mark.width) // 2, (splash_size - mark.height) // 2), mark)
    write(splash, 'splash.png')

    # Light-mode splash variant.
    splash_light = Image.new('RGB', (splash_size, splash_size), BONE)
    mark_dark = _mark(int(splash_size * 0.34), (0, 0, 0, 0), MOSS + (255,), MOSS + (255,))
    splash_light.paste(
        mark_dark, ((splash_size - mark_dark.width) // 2, (splash_size - mark_dark.height) // 2), mark_dark
    )
    write(splash_light, 'splash-light.png')

    # Web favicon.
    write(_mark(64, MOSS_DEEP + (255,), BONE + (255,), BONE + (255,)).convert('RGB'), 'favicon.png')

    print('Done.')


if __name__ == '__main__':
    main()
