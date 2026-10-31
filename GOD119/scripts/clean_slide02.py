"""Remove the static arrow from GOD119 slide 02; the web layer animates its replacement.

Edits only the final redesigned slide 02. All slide text, photos, and other slides remain intact.
"""
from hashlib import sha256
from pathlib import Path
from PIL import Image
import json

TARGET = Path("GOD119/slides/slide-02.webp")
KNOWN_SOURCE = "8e7f14d1023ffb68043c030f7f43fc49f09acf1335c8d36b8e026222fdce4521"
MARKER = Path("GOD119/slides/slide-02-arrow-clean.json")

if not TARGET.exists():
    raise SystemExit("Slide 02 image not found.")

current_sha = sha256(TARGET.read_bytes()).hexdigest()
if MARKER.exists():
    try:
        marker = json.loads(MARKER.read_text(encoding="utf-8"))
    except Exception:
        marker = {}
    if marker.get("sha256") == current_sha:
        print("Slide 02 arrow already removed.")
        raise SystemExit(0)

if current_sha != KNOWN_SOURCE:
    raise SystemExit("Unexpected slide 02 image. Nothing changed. sha256=" + current_sha)

with Image.open(TARGET) as opened:
    image = opened.convert("RGB")
if image.size != (1920, 1080):
    raise SystemExit("Unexpected slide dimensions.")

# Validated static chevron pixels are x=896..1019, y=549..658.
# Only the navy center gap is inpainted, away from the left and right cards.
pixels = image.load()
for y in range(541, 672):
    left = tuple(round(sum(pixels[x, y][k] for x in range(880, 884))/4) for k in range(3))
    right = tuple(round(sum(pixels[x, y][k] for x in range(1037, 1041))/4) for k in range(3))
    for x in range(885, 1035):
        t = (x-885)/150
        pixels[x, y] = tuple(round((1-t)*left[k]+t*right[k]) for k in range(3))

image.save(TARGET, "WEBP", quality=91, method=6)
new_sha = sha256(TARGET.read_bytes()).hexdigest()
MARKER.write_text(json.dumps({"sha256": new_sha, "note": "Original static arrow removed; CSS draws the only animated arrow."}, indent=2)+"\n", encoding="utf-8")
print("Slide 02 static arrow removed. sha256="+new_sha)
