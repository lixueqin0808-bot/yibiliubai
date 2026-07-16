from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "ink-silver-steel-edge-source.png"
OUTPUT = ROOT / "src" / "assets" / "ink-silver-steel-edge-strip.webp"


def chroma_alpha(pixel: tuple[int, int, int, int]) -> int:
    red, green, blue, _ = pixel
    distance = ((red - 255) ** 2 + green**2 + (blue - 255) ** 2) ** 0.5
    return 0 if distance < 36 else 255


def main() -> None:
    image = Image.open(SOURCE).convert("RGBA")
    image.putalpha(Image.new("L", image.size, 0))
    source = Image.open(SOURCE).convert("RGBA")
    alpha = Image.new("L", image.size)
    alpha.putdata([chroma_alpha(pixel) for pixel in source.getdata()])
    image.putalpha(alpha)
    threshold = 64
    active_rows = [
        y for y in range(image.height)
        if sum(alpha.getpixel((x, y)) >= threshold for x in range(image.width)) >= image.width * 0.45
    ]
    active_columns = [
        x for x in range(image.width)
        if sum(alpha.getpixel((x, y)) >= threshold for y in range(image.height)) >= max(4, image.height * 0.08)
    ]
    if not active_rows or not active_columns:
        raise RuntimeError("The generated silver steel strip has no opaque pixels.")

    left, right = min(active_columns), max(active_columns) + 1
    top, bottom = min(active_rows), max(active_rows) + 1
    padding = 2
    crop = image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))
    crop.save(OUTPUT, "WEBP", lossless=True, method=6)
    print(f"Wrote {OUTPUT}: {crop.width}x{crop.height}")


if __name__ == "__main__":
    main()
