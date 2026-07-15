from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "小游戏图片素材" / "美术2.0" / "美术3.0"
TARGET = ROOT / "v2" / "src" / "assets"

ASSETS = {
    "ink-slate-surface-v3.png": "ink-slate-map-texture.webp",
    "普通梯形切面边条.png": "ink-slate-bevel-strip.webp",
    "e7e7f1bc-73f9-422e-b92d-104caf34cd61.png": "ink-iron-edge-strip.webp",
}


def remove_magenta(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, alpha = pixels[x, y]
            magenta_strength = min(red, blue) - green
            if red > 145 and blue > 110 and green < 135 and magenta_strength > 85:
                pixels[x, y] = (red, green, blue, 0)
            elif red > 135 and blue > 95 and green < 145 and magenta_strength > 60:
                soft_alpha = max(0, min(alpha, int((85 - magenta_strength) * 10)))
                pixels[x, y] = (red, green, blue, soft_alpha)
    return rgba


def trim_alpha(image: Image.Image, padding: int = 2) -> Image.Image:
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        raise ValueError("image contains no visible pixels after removing magenta")
    left, top, right, bottom = bounds
    return image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))


def write_asset(source_name: str, target_name: str) -> None:
    image = Image.open(SOURCE / source_name)
    output = image.convert("RGB") if target_name == "ink-slate-map-texture.webp" else trim_alpha(remove_magenta(image))
    output.save(TARGET / target_name, "WEBP", quality=94, method=6)
    print(f"{target_name}: {output.width}x{output.height}")


for source_name, target_name in ASSETS.items():
    write_asset(source_name, target_name)
