# Spot-the-difference pairs for the two A5 booklets (run from the repo root:
# python3 docs/pamflett/lag-finn-feil.py). Each edit is a small, deliberate
# change to a copy of a game scene. Writes the pair and an answer key.
from PIL import Image, ImageDraw, ImageOps
import colorsys
SC = 'web/public/images/tryllegarden/scene'
OUT = 'docs/pamflett/hefter'

def hue(im, box, frm, to, sat_min=0.18, v_max=1.0):
    """Rotate pixels whose hue lies in frm (deg range) to hue `to` inside box."""
    reg = im.crop(box).convert('RGB'); px = reg.load()
    for y in range(reg.height):
        for x in range(reg.width):
            r, g, b = px[x, y]
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            hd = h * 360
            inr = (frm[0] <= hd <= frm[1]) if frm[0] <= frm[1] else (hd >= frm[0] or hd <= frm[1])
            if s >= sat_min and v <= v_max and inr:
                r2, g2, b2 = colorsys.hsv_to_rgb(to / 360, s, v)
                px[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255))
    im.paste(reg, box[:2])

def patch(im, box, src_dx, src_dy=0):
    """Cover box with the same-sized area shifted by (dx, dy): removes an object."""
    x0, y0, x1, y1 = box
    im.paste(im.crop((x0 + src_dx, y0 + src_dy, x1 + src_dx, y1 + src_dy)), (x0, y0))

def remove(im, cx, cy, rx, ry):
    """Paint an object out (OpenCV inpainting inside an ellipse)."""
    import cv2, numpy as np
    arr = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
    mask = np.zeros(arr.shape[:2], np.uint8)
    cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    out = cv2.inpaint(arr, mask, 9, cv2.INPAINT_TELEA)
    im.paste(Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB)))

def mirror(im, box):
    im.paste(ImageOps.mirror(im.crop(box)), box[:2])

def star(im, cx, cy, r):
    d = ImageDraw.Draw(im)
    pts = []
    import math
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * .42
        pts.append((cx + rr * math.cos(a), cy - rr * math.sin(a)))
    d.polygon(pts, fill=(255, 248, 215))

def make(name, scene, edits):
    a = Image.open(f'{SC}/{scene}').convert('RGB')
    b = a.copy()
    marks = []
    for kind, args, mark in edits:
        kind(b, *args); marks.append(mark)
    a.save(f'{OUT}/{name}-a.png'); b.save(f'{OUT}/{name}-b.png')
    key = b.copy(); d = ImageDraw.Draw(key)
    for (cx, cy, r) in marks:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(220, 20, 60), width=6)
    key.save(f'{OUT}/{name}-fasit.png')
    print(name, len(marks), 'forskjeller')

# Small ones: Bakstehuset, 5 clear differences.
make('finn-feil-sma', 'bakstehuset.webp', [
    (remove, (872, 176, 30, 30), (872, 176, 45)),                                  # the moon is gone
    (hue, ((1203, 450, 1397, 580), (345, 28), 215, .45), (1300, 510, 110)),         # red tin turns blue
    (hue, ((440, 255, 580, 335), (350, 10), 120, .5), (510, 292, 78)),              # nisse hat turns green
    (hue, ((585, 110, 680, 420), (345, 10), 215, .4), (632, 265, 95)),             # red pattern on the left curtain turns blue
    (remove, (808, 405, 9, 20), (808, 408, 45)),                                    # the candle is out
])
# Big ones: Stua, 8 subtle differences.
make('finn-feil-store', 'stua.webp', [
    (remove, (795, 180, 24, 26), (795, 180, 38)),                                   # the moon is gone
    (hue, ((352, 262, 432, 402), (44, 80), 215, .4, .6), (392, 330, 70)),           # green stocking turns blue
    (hue, ((755, 345, 852, 462), (44, 80), 0, .4, .62), (802, 405, 62)),            # green heart turns red
    (mirror, ((785, 468, 872, 506),), (828, 487, 52)),                             # scissors turned round
    (hue, ((1262, 112, 1330, 160), (10, 35), 210, .4), (1296, 136, 46)),            # the little pot on the cupboard turns blue
    (remove, (893, 338, 9, 18), (893, 340, 32)),                                    # the candle is out
    (hue, ((860, 150, 958, 195), (345, 10), 110, .45), (909, 172, 58)),             # curtain stars turn green
    (star, (700, 165, 9), (700, 165, 30)),                                          # an extra star in the window
])
