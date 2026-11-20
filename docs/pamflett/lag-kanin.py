# Cut the magic rabbit (and its top hat) out of the game's start picture
# web/public/images/tryllegarden/jul-laven.webp, for the paper puzzles.
# Run from the repo root: python3 docs/pamflett/lag-kanin.py
# Writes docs/pamflett/figur/kanin-hatt.png (rabbit in the hat) and
# kanin.png (rabbit only, cut at the hat rim), both with transparency.
import cv2, numpy as np
SRC = 'web/public/images/tryllegarden/jul-laven.webp'
OUT = 'docs/pamflett/figur'
im = cv2.imread(SRC)
# Coordinates below were measured on a 1484 px wide copy; scale to the source.
k = im.shape[1] / 1484
x0, y0, x1, y1 = 490, 400, 770, 730
UP = 4  # work at 4x the measured size
c = cv2.resize(im[round(y0*k):round(y1*k), round(x0*k):round(x1*k)],
               ((x1-x0)*UP, (y1-y0)*UP), interpolation=cv2.INTER_LANCZOS4)
h, w = c.shape[:2]
hsv = cv2.cvtColor(c, cv2.COLOR_BGR2HSV).astype(int)
H, S, V = hsv[..., 0]*2, hsv[..., 1]/255, hsv[..., 2]/255
cream = (S < 0.30) & (V > 0.70)
pink = ((H > 320) | (H < 12)) & (S > 0.15) & (V > 0.6)
warm = (H >= 15) & (H <= 55) & (S > 0.38)   # the barn's golden background
mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
mask[cream | pink | (V < 0.25)] = cv2.GC_PR_FGD
mask[warm] = cv2.GC_BGD
mask[:, :int(.02*w)] = cv2.GC_BGD; mask[:, int(.97*w):] = cv2.GC_BGD
cv2.grabCut(c, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_MASK)
m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
m = np.where(lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])), 255, 0).astype(np.uint8)
cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
rab = np.zeros_like(m); cv2.drawContours(rab, cs, -1, 255, -1)   # rabbit, holes filled
# The hat's golden rim looks like the background, so its outline is drawn by hand.
HAT = [(502,612),(505,604),(520,599),(560,597),(620,596),(680,596),(730,598),(752,602),(760,608),(757,614),
       (745,619),(725,626),(728,712),(720,718),(690,722),(640,723),(590,722),(555,719),(545,713),(551,627),
       (520,622),(505,618)]
hat = np.zeros_like(m)
cv2.fillPoly(hat, [np.array([((x-x0)*UP, (y-y0)*UP) for x, y in HAT], np.int32)], 255)

def write(name, alpha, scale=.5):
    alpha = cv2.GaussianBlur(alpha, (5, 5), 0)
    rgba = cv2.cvtColor(c, cv2.COLOR_BGR2BGRA); rgba[:, :, 3] = alpha
    ys, xs = np.where(alpha > 128)
    bx, by = xs.min(), ys.min()
    rgba = rgba[by:ys.max()+1, bx:xs.max()+1]
    rgba = cv2.resize(rgba, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{OUT}/{name}.png', rgba)
    # print how to map measured coordinates to this image (for overlays)
    print(f'{name}: {rgba.shape[1]}x{rgba.shape[0]}  px = (x-{x0 + bx/UP:.2f})*{UP*scale}, (y-{y0 + by/UP:.2f})*{UP*scale}')

write('kanin-hatt', np.maximum(rab, hat))
# rabbit only: cut straight at the hat's rim
only = rab.copy(); only[(605-y0)*UP:, :] = 0
write('kanin', only)
