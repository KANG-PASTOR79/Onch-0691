"""Restore the original portrait aspect ratio of the photo poster on slide 04.

Only the distorted photo in GOD119/slides/slide-04.webp is changed.
All text, cards, links, and other slides are untouched.
"""
from pathlib import Path
from hashlib import sha256
from PIL import Image, ImageDraw
import json

slide = Path("GOD119/slides/slide-04.webp")
marker = Path("GOD119/slides/slide-04-upright.json")
original_sha = "af45bc8d13d2b17308be578216d6a9b83a7a8c5a4df58ab3dff6e5ec40c25031"
if not slide.is_file():
    raise SystemExit("Slide 04 not found")
current_sha = sha256(slide.read_bytes()).hexdigest()
if marker.exists():
    try:
        m = json.loads(marker.read_text(encoding="utf-8"))
        if m.get("sha256") == current_sha:
            print("Slide 04 already corrected")
            raise SystemExit(0)
    except (ValueError, OSError):
        pass
if current_sha != original_sha:
    raise SystemExit("Unexpected Slide 04 version. No changes made: " + current_sha)
with Image.open(slide) as opened:
    im = opened.convert("RGB")
if im.size != (1920, 1080):
    raise SystemExit("Unexpected slide dimensions")
poster = im.crop((145, 419, 698, 834))
draw = ImageDraw.Draw(im)
draw.rectangle((144, 418, 700, 836), fill=(19, 36, 60))
# Correct 2:3 aspect ratio; reposition within the existing left-side photo frame.
upright = poster.resize((405, 608), Image.Resampling.LANCZOS)
im.paste(upright, (220, 322))
im.save(slide, "WEBP", quality=94, method=6)
new_sha = sha256(slide.read_bytes()).hexdigest()
marker.write_text(json.dumps({
    "design": "slide04-upright-portrait-v1",
    "slide": 4,
    "originalAspectRatio": "2:3",
    "sha256": new_sha
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Slide 04 fixed: " + new_sha)
