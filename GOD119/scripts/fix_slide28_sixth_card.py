"""Change only card 06 wording on original GOD119 slide 28.

Replace the embedded text '다양한 홍보 영상 만들기' with '다양한 서식 만들기'
without changing the sixth card frame/icon or any other cards.
"""
from pathlib import Path
from subprocess import check_output
from hashlib import sha256
import json
from PIL import Image, ImageDraw, ImageFont

SLIDE = Path("GOD119/slides/slide-28.webp")
MARKER = Path("GOD119/slides/slide-28-sixth-card.json")
SOURCE_SHA = "ccbdf9e470721fbfa78a46600b1cab7ad079267f"
TITLE = "다양한 서식 만들기"
VERSION = "slide28-sixth-form-title-v1"
if not SLIDE.exists():
    raise SystemExit("Slide 28 WebP is missing")
if MARKER.exists():
    try:
        data = json.loads(MARKER.read_text(encoding="utf-8"))
        if data.get("design") == VERSION and data.get("title") == TITLE and data.get("sha256") == sha256(SLIDE.read_bytes()).hexdigest():
            print("Slide 28 card 06 is already updated")
            raise SystemExit(0)
    except (ValueError, OSError):
        pass
git_sha = check_output(["git", "hash-object", str(SLIDE)], text=True).strip()
if git_sha != SOURCE_SHA:
    raise SystemExit("Slide 28 image changed; refusing unreviewed overwrite: " + git_sha)
font_path = Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc")
if not font_path.exists():
    raise SystemExit("fonts-noto-cjk is required")
with Image.open(SLIDE) as original:
    frame = original.convert("RGB")
if frame.size != (1920, 1080):
    raise SystemExit("Unexpected slide dimension: " + str(frame.size))

# The card 06 right-hand title is printed within y approximately 766–811.
# Only reconstruct the glyph area, sampling background lines safely inside
# the card's center (border/icon and text of all five other cards untouched).
# Vertical interpolated backdrop preserves the card's existing subtle gradient.
pixels = frame.load()
for x in range(1120, 1710):
    top = pixels[x, 745]
    bottom = pixels[x, 835]
    for y in range(760, 820):
        t = (y - 745) / 90.0
        pixels[x, y] = tuple(round(top[k] * (1 - t) + bottom[k] * t) for k in range(3))
draw = ImageDraw.Draw(frame)
font = ImageFont.truetype(str(font_path), 36, index=1)
if draw.textlength(TITLE, font=font) > 550:
    raise SystemExit("New title would be clipped")
draw.text((1128, 768), TITLE, font=font, fill=(242, 245, 251), anchor="lt")
frame.save(SLIDE, "WEBP", quality=95, method=6)
digest = sha256(SLIDE.read_bytes()).hexdigest()
MARKER.write_text(json.dumps({
    "slide": 28,
    "card": 6,
    "title": TITLE,
    "design": VERSION,
    "sha256": digest,
    "scope": "Replace the wording of card 06 only, with no other content changes"
}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("Slide 28 card 06 updated: " + TITLE + "; sha256=" + digest)
