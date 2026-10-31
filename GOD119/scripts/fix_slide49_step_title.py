"""Replace only the heading on slide 49 with the lecturer's exact Stage 1 title.

Everything below the heading, slide navigation and all other slides remain
unchanged. Reconstruct the flat navy heading background from adjacent scanlines
instead of stretching or altering the lecture materials.
"""
from pathlib import Path
from hashlib import sha256
from subprocess import check_output
import json
from PIL import Image, ImageDraw, ImageFont

IMAGE=Path("GOD119/slides/slide-49.webp")
MARKER=Path("GOD119/slides/slide-49-step-title.json")
ORIGINAL_GIT_SHA="d35a59ff1c63f2dc67cc8fa24071aadda5eda64f"
TITLE="1단계 · 실제 프롬프트 사용으로 인한 목회계획 제작"
VERSION="slide49-step1-heading-v1"

if not IMAGE.is_file():
    raise SystemExit("Missing GOD119 slide 49 image")
if MARKER.exists():
    try:
        current=json.loads(MARKER.read_text(encoding="utf-8"))
        if (current.get("design")==VERSION and current.get("title")==TITLE
                and current.get("sha256")==sha256(IMAGE.read_bytes()).hexdigest()):
            print("Slide 49 Stage 1 title is already installed.")
            raise SystemExit(0)
    except (OSError, ValueError):
        pass
original=check_output(["git", "hash-object", str(IMAGE)], text=True).strip()
if original!=ORIGINAL_GIT_SHA:
    raise SystemExit("Slide 49 source was changed; refusing to overwrite: "+original)

font=Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc")
if not font.is_file():
    raise SystemExit("Korean Noto Sans CJK bold font not installed")
with Image.open(IMAGE) as source:
    picture=source.convert("RGB")
if picture.size!=(1920,1080):
    raise SystemExit("Unexpected image dimensions: "+repr(picture.size))

# Original title: x≈96–1100, y≈174–224. The heading's navy background
# changes gradually, so interpolate the unlettered rows y=149 and y=244.
# Keep the header rule (y=127), gold underline (y=257), main content and
# footer untouched. Cover only the title band.
pixels=picture.load()
for x in range(95,1330):
    top=pixels[x,149]
    bottom=pixels[x,244]
    for y in range(150,244):
        t=(y-149)/95
        pixels[x,y]=tuple(round(top[channel]*(1-t)+bottom[channel]*t)
                            for channel in range(3))

draw=ImageDraw.Draw(picture)
heading=ImageFont.truetype(str(font),56,index=1)
if draw.textlength(TITLE,font=heading)>1320-96:
    raise SystemExit("Stage 1 heading would be clipped")
draw.text((96,169),TITLE,font=heading,fill=(242,246,253),anchor="lt")
picture.save(IMAGE,"WEBP",quality=94,method=6)
after=sha256(IMAGE.read_bytes()).hexdigest()
MARKER.write_text(json.dumps({
    "slide":49, "design":VERSION,"title":TITLE,"sha256":after,
    "note":"Heading only: original 49th slide content remains intact."
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Added Stage 1 prefix to slide 49; sha256="+after)
