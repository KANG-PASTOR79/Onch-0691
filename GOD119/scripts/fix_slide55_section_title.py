"""Fix only the heading of original GOD119 slide 55.

The displayed title changes from '설교 쇼츠 제작' to '4. 설교 쇼츠 제작'.
All slide body content, images, link overlays, and annotation logic are kept.
"""
from pathlib import Path
from subprocess import check_output
from hashlib import sha256
import json
from PIL import Image, ImageDraw, ImageFont

FILE=Path("GOD119/slides/slide-55.webp")
MARKER=Path("GOD119/slides/slide-55-section-title.json")
SOURCE_SHA="cc0c879761d579959eb124e479bce7c10bdaf932"
TITLE="4. 설교 쇼츠 제작"
VERSION="slide55-section4-title-v1"

if not FILE.is_file():
    raise SystemExit("Missing slide 55 image")
if MARKER.is_file():
    try:
        data=json.loads(MARKER.read_text(encoding="utf-8"))
        if data.get("design")==VERSION and data.get("title")==TITLE and data.get("sha256")==sha256(FILE.read_bytes()).hexdigest():
            print("Slide 55 title already corrected")
            raise SystemExit(0)
    except (OSError, ValueError):
        pass
current=check_output(["git","hash-object",str(FILE)],text=True).strip()
if current!=SOURCE_SHA:
    raise SystemExit("Unexpected slide 55 version: "+current+"; not modifying.")
font_path=Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc")
if not font_path.is_file():
    raise SystemExit("Missing Noto CJK bold font. Install fonts-noto-cjk")
with Image.open(FILE) as source:
    img=source.convert("RGB")
if img.size!=(1920,1080):
    raise SystemExit("Unexpected dimensions: "+repr(img.size))
# Only repair the text band's background. The original underline is at y=256
# and all body elements start below y=300; neither is touched.
pixels=img.load()
for x in range(96,900):
    top=pixels[x,149]
    bottom=pixels[x,244]
    for y in range(150,244):
        t=(y-149)/95
        pixels[x,y]=tuple(round(top[c]*(1-t)+bottom[c]*t) for c in range(3))
pen=ImageDraw.Draw(img)
font=ImageFont.truetype(str(font_path),56,index=1)
if pen.textlength(TITLE,font=font)>800:
    raise SystemExit("Heading unexpectedly too wide")
pen.text((98,171),TITLE,font=font,fill=(244,247,254),anchor="lt")
img.save(FILE,"WEBP",quality=94,method=6)
digest=sha256(FILE.read_bytes()).hexdigest()
MARKER.write_text(json.dumps({
    "slide":55,
    "design":VERSION,
    "title":TITLE,
    "sha256":digest,
    "changes":"Slide heading only; rest of original slide preserved"
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Slide 55 title corrected; sha256="+digest)
