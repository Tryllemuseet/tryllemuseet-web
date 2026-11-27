# "Finn nissens skygge" for the two A5 booklets (run from the repo root:
# python3 docs/pamflett/lag-skygge.py). The nisse in colour, and black shadows
# to choose from: one is exactly his, the others differ. Seeded, so the
# answer letter is the same every time; it is printed and written to the key.
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import random
random.seed(2026)
FIG = 'web/public/images/tryllegarden/figur'
OUT = 'docs/pamflett/hefter'
S = 3  # upscale: figures are 440 px tall, print wants ~1300
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'

def alpha(name):
    return Image.open(f'{FIG}/{name}.webp').convert('RGBA').getchannel('A')

def shadow(mask):
    m = mask.resize((mask.width * S, mask.height * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2))
    m = m.point(lambda v: 255 if v > 120 else 0)
    im = Image.new('RGBA', m.size, (0, 0, 0, 0))
    im.paste((25, 22, 30, 255), mask=m)
    return im

def soften(m):
    # Round off the cut edges so a change looks drawn, not clipped.
    return m.filter(ImageFilter.GaussianBlur(3)).point(lambda v: 255 if v > 128 else 0)
def cut_tail(m):
    m = m.copy(); ImageDraw.Draw(m).ellipse((255, 190, 360, 320), fill=0); return soften(m)
def merge_legs(m):
    m = m.copy(); ImageDraw.Draw(m).rectangle((150, 335, 196, 392), fill=255); return soften(m)
def pompom(m):
    m = m.copy(); ImageDraw.Draw(m).ellipse((292, 232, 321, 261), fill=255); return soften(m)
def no_hand(m):
    m = m.copy(); ImageDraw.Draw(m).ellipse((-20, 80, 78, 182), fill=0); return soften(m)

def build(name, options):
    base = 'nisse-vinker'
    right = shadow(alpha(base))
    items = [('rett', right)] + [(lbl, shadow(fn())) for lbl, fn in options]
    random.shuffle(items)
    letters = 'ABCDEF'[:len(items)]
    cols = 3 if len(items) == 6 else 2
    cw, ch = 1100, 1450
    rows = (len(items) + cols - 1) // cols
    fig = Image.open(f'{FIG}/{base}.webp').convert('RGBA')
    fig = fig.resize((fig.width * S, fig.height * S), Image.LANCZOS)
    top = 1500
    W, H = cols * cw, top + rows * ch
    page = Image.new('RGB', (W, H), 'white')
    page.paste(fig, ((W - fig.width) // 2, 80), fig)
    d = ImageDraw.Draw(page)
    f = ImageFont.truetype(FONT, 110)
    answer = None
    for i, ((lbl, im), L) in enumerate(zip(items, letters)):
        sc = min((cw - 120) / im.width, (ch - 260) / im.height)
        im = im.resize((int(im.width * sc), int(im.height * sc)), Image.LANCZOS)
        x = (i % cols) * cw + (cw - im.width) // 2
        y = top + (i // cols) * ch + 40
        page.paste(im, (x, y), im)
        cx = (i % cols) * cw + cw // 2
        d.text((cx, y + im.height + 40), L, font=f, fill=(140, 20, 30), anchor='mt')
        if lbl == 'rett': answer = L
    page.save(f'{OUT}/{name}.png', dpi=(300, 300))
    open(f'{OUT}/{name}-fasit.txt', 'w').write(f'Riktig skygge: {answer}\n')
    print(name, 'riktig:', answer)

build('skygge-store', [
    ('klapper', lambda: alpha('nisse-klapper')),
    ('grubler', lambda: alpha('nisse-grubler')),
    ('uten dusk', lambda: cut_tail(alpha('nisse-vinker'))),
    ('bein i ett', lambda: merge_legs(alpha('nisse-vinker'))),
    ('uten hånd', lambda: no_hand(alpha('nisse-vinker'))),
])
build('skygge-sma', [
    ('klapper', lambda: alpha('nisse-klapper')),
    ('gutt', lambda: alpha('gutt-hei')),
    ('jente', lambda: alpha('jente-hei')),
])
