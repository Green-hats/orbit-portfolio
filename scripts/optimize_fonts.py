"""Build the Latin webfonts from the retained, wider source subsets.

Run after editing page copy and regenerating zh.html. Chinese WenKai files are
already tightly subset and are intentionally left alone.
"""

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SOURCES = ROOT / "originals" / "fonts"
OUTPUT = DIST / "assets" / "fonts"

# Preserve printable ASCII for future short edits, plus non-ASCII punctuation
# and letters currently present in the rendered pages or interaction code.
content = "".join(
    (DIST / filename).read_text(encoding="utf-8")
    for filename in ("index.html", "zh.html", "site.js", "styles.css")
)
characters = set(range(0x20, 0x7F)) | {ord(char) for char in content}

for source in sorted(SOURCES.glob("*latin.woff2")):
    font = TTFont(source)
    options = subset.Options()
    options.layout_features = ["*"]  # Keep kerning and other layout behavior.
    options.flavor = "woff2"
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=characters)
    sub.subset(font)
    font.flavor = "woff2"
    destination = OUTPUT / source.name
    font.save(destination)
    print(f"{source.name}: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes")
