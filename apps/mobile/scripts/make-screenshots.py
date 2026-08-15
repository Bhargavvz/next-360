#!/usr/bin/env python3
"""
Turn raw device captures into framed, captioned store screenshots.

Both stores reject screenshots whose dimensions are even slightly off, so this
letterboxes each capture onto an exact canvas rather than scaling it to fit —
scaling would distort the UI and change the type size reviewers see.

Usage:
    python3 scripts/make-screenshots.py --input ./raw-captures --out ./store-screenshots

Captions are read from `captions.txt` in the input directory (one per line, in
filename order). Missing captions are simply skipped.
"""

from __future__ import annotations

from PIL import Image, ImageDraw, ImageFont
import argparse
import pathlib
import sys

# Brand tokens — must match lib/theme.ts
MOSS_DEEP = (11, 58, 36)
BONE = (251, 250, 247)

# Store-required canvases. Add sizes here as the stores change them.
TARGETS = {
    'ios-6.9': (1320, 2868),
    'ios-6.5': (1242, 2688),
    'play-phone': (1080, 1920),
}

CAPTION_BAND = 0.20  # share of canvas height given to the caption


def load_font(size):
    """Prefer a real face; fall back to PIL's bitmap font rather than failing."""
    for candidate in (
        '/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
        '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
    ):
        if pathlib.Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                continue
    return ImageFont.load_default()


def frame(capture: Image.Image, target: tuple[int, int], caption: str | None) -> Image.Image:
    width, height = target
    canvas = Image.new('RGB', target, MOSS_DEEP)
    draw = ImageDraw.Draw(canvas)

    band = int(height * CAPTION_BAND) if caption else int(height * 0.06)

    # Fit the capture into the remaining space, preserving aspect ratio.
    avail_w = int(width * 0.82)
    avail_h = height - band - int(height * 0.06)
    scale = min(avail_w / capture.width, avail_h / capture.height)
    shot = capture.resize(
        (max(1, int(capture.width * scale)), max(1, int(capture.height * scale))),
        Image.LANCZOS,
    )

    # Rounded corners so the capture reads as a device screen, not a flat paste.
    radius = int(shot.width * 0.06)
    mask = Image.new('L', shot.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, shot.width, shot.height], radius=radius, fill=255)

    x = (width - shot.width) // 2
    y = band + (avail_h - shot.height) // 2
    canvas.paste(shot, (x, y), mask)

    if caption:
        font = load_font(int(width * 0.058))
        # Wrap by measured width rather than a character count — the same count
        # overflows badly between short and wide words.
        words, lines, line = caption.split(), [], ''
        for word in words:
            probe = f'{line} {word}'.strip()
            if draw.textlength(probe, font=font) <= width * 0.84:
                line = probe
            else:
                if line:
                    lines.append(line)
                line = word
        if line:
            lines.append(line)

        line_h = int(width * 0.072)
        total = len(lines) * line_h
        ty = (band - total) // 2
        for text in lines:
            tw = draw.textlength(text, font=font)
            draw.text(((width - tw) / 2, ty), text, font=font, fill=BONE)
            ty += line_h

    return canvas


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, help='directory of raw PNG captures')
    parser.add_argument('--out', required=True, help='output directory')
    parser.add_argument('--targets', nargs='*', default=list(TARGETS), help=f'subset of {list(TARGETS)}')
    args = parser.parse_args()

    src = pathlib.Path(args.input)
    dst = pathlib.Path(args.out)

    if not src.is_dir():
        sys.exit(f'No such directory: {src}')

    captures = sorted(p for p in src.iterdir() if p.suffix.lower() in {'.png', '.jpg', '.jpeg'})
    if not captures:
        sys.exit(f'No images found in {src}')

    caption_file = src / 'captions.txt'
    captions = (
        [l.strip() for l in caption_file.read_text().splitlines() if l.strip()]
        if caption_file.exists()
        else []
    )

    for name in args.targets:
        if name not in TARGETS:
            sys.exit(f'Unknown target {name!r}; expected one of {list(TARGETS)}')
        out_dir = dst / name
        out_dir.mkdir(parents=True, exist_ok=True)

        for i, path in enumerate(captures):
            caption = captions[i] if i < len(captions) else None
            with Image.open(path) as im:
                framed = frame(im.convert('RGB'), TARGETS[name], caption)
            out_path = out_dir / f'{i + 1:02d}.png'
            framed.save(out_path, 'PNG', optimize=True)
            print(f'{out_path}  {TARGETS[name][0]}×{TARGETS[name][1]}')

    print('\nDone. Upload each folder to the matching store listing size.')


if __name__ == '__main__':
    main()
