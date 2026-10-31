"""Add the lecturer's requested title to slide 05, without changing its photograph.

Title: 대심방 시 부재중 합성
The WebP is generated with the existing title treatment used throughout GOD119.
"""
from pathlib import Path
from hashlib import sha256
import json

from PIL import Image, ImageDraw, ImageFont

slide=Path("GOD119/slides/slide-05.webp")
marker=Path("GOD119/slides/slide-05-title.json")
expected="6b822702acb4d20a44f8b9583ff2520cd0812ffe3cd591711381693f76fdda0e"
title="대심방 시 부재중 합성"
if not slide.is_file():
    raise SystemExit("Missing slide-05.webp")
current=sha256(slide.read_bytes()).hexdigest()
if marker.exists():
    try:
        version=json.loads(marker.read_text(encoding="utf-8"))
        if version.get("sha256")==current and version.get("title")==title:
            print("Slide 05 title already installed")
            raise SystemExit(0)
    except (ValueError, OSError):
        pass
if current!=expected:
    raise SystemExit("Unknown slide-05.webp version. Not overwriting: "+current)
font=Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc")
if not font.exists():
    raise SystemExit("Missing fonts-noto-cjk package")
with Image.open(slide) as opened:
    image=opened.convert("RGB")
if image.size!=(1920,1080):
    raise SystemExit("Unexpected slide aspect/dimensions")
draw=ImageDraw.Draw(image)
style=ImageFont.truetype(str(font),56,index=1)
draw.text((99,151),title,font=style,fill=(242,246,253),anchor="lt")
image.save(slide,"WEBP",quality=92,method=6)
updated=sha256(slide.read_bytes()).hexdigest()
marker.write_text(json.dumps({
    "design":"god119-slide05-title-v1",
    "slide":5,
    "title":title,
    "sha256":updated
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Installed slide 05 title:",updated)
