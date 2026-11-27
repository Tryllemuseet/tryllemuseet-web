# Paper puzzles for the two A5 booklets «Jul på Årvoll gård» (small and big
# children). Run from the repo root: python3 docs/pamflett/lag-hefte-oppgaver.py
# then node docs/pamflett/tegn-png.mjs to render the SVGs to print PNGs.
# Seeded: the same puzzles every time. Writes SVG + answer keys to hefter/.
import random, math, base64, sys
random.seed(1225)
OUT = 'docs/pamflett/hefter'
INK, RED, GREEN, GOLD, PAPER = '#2b2420', '#b3262d', '#1f5c3a', '#c9962f', '#fffdf6'

def save(name, body, w, h):
    open(f'{OUT}/{name}.svg', 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
        f'<rect width="{w}" height="{h}" fill="white"/>{body}</svg>')

def img(path, x, y, w, h):
    data = base64.b64encode(open(path, 'rb').read()).decode()
    return f'<image href="data:image/webp;base64,{data}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid meet"/>'

# ---------- the magic rabbit from the game's start picture (see lag-kanin.py) ----------
def png(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
KANIN_HATT, KANIN = 'docs/pamflett/figur/kanin-hatt.png', 'docs/pamflett/figur/kanin.png'
KH_W, KH_H = 516, 646    # size of kanin-hatt.png
K_W, K_H = 433, 410      # size of kanin.png

def star_path(cx, cy, r, inner=.45, n=5):
    pts = []
    for i in range(n * 2):
        a = -math.pi / 2 + i * math.pi / n; rr = r if i % 2 == 0 else r * inner
        pts.append(f'{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}')
    return 'M' + ' L'.join(pts) + ' Z'

def rabbit_pic(x, y, s=1, mirror=False, bow=None, band=None, star=None, wand=False, sparkle=False):
    """kanin-hatt.png with optional extras; (x, y) is the picture's centre.
    The extras are placed in the picture's own pixel coordinates."""
    g = [f'<g transform="translate({x},{y}) scale({s * (-1 if mirror else 1)},{s}) translate({-KH_W/2},{-KH_H/2})">',
         f'<use href="#kanin-hatt"/>']
    if band:   # hat band just under the brim
        g.append(f'<path d="M95 470 L447 470 L449 500 L93 500 Z" fill="{band}"/>')
    if star:   # star on the front of the hat
        g.append(f'<path d="{star_path(272, 575, 40)}" fill="{star}" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>')
    if bow:    # bow tie under the chin
        g.append(f'<g transform="translate(282,338)" stroke="{INK}" stroke-width="4" stroke-linejoin="round">'
                 f'<path d="M0 0 L-38 -20 L-38 20 Z M0 0 L38 -20 L38 20 Z" fill="{bow}"/><circle r="10" fill="{bow}"/></g>')
    if wand:   # magic wand held up in the raised right paw
        g.append(f'<g transform="translate(462,300) rotate(12)" stroke="{INK}" stroke-width="4">'
                 f'<rect x="-9" y="-115" width="18" height="115" rx="4" fill="{INK}"/>'
                 f'<rect x="-9" y="-115" width="18" height="26" rx="4" fill="#fff"/></g>')
    if sparkle: # a big sparkle by the right ear
        g.append(f'<path d="{star_path(420, 70, 46, .22, 4)}" fill="{GOLD}" stroke="{INK}" stroke-width="3"/>')
    g.append('</g>')
    return ''.join(g)

def rabbit_defs():
    return f'<defs><image id="kanin-hatt" href="{png(KANIN_HATT)}" width="{KH_W}" height="{KH_H}"/></defs>'

# ---------- maze: the rabbit must get home to the magic hat ----------
def maze(name, cols, rows, cell):
    walls = {(c, r): {'n': True, 's': True, 'e': True, 'w': True} for c in range(cols) for r in range(rows)}
    seen = {(0, 0)}; stack = [(0, 0)]
    D = {'n': (0, -1, 's'), 's': (0, 1, 'n'), 'e': (1, 0, 'w'), 'w': (-1, 0, 'e')}
    while stack:
        c, r = stack[-1]
        opts = [(k, c + dx, r + dy, o) for k, (dx, dy, o) in D.items() if 0 <= c + dx < cols and 0 <= r + dy < rows and (c + dx, r + dy) not in seen]
        if not opts: stack.pop(); continue
        k, nc, nr, o = random.choice(opts)
        walls[(c, r)][k] = False; walls[(nc, nr)][o] = False
        seen.add((nc, nr)); stack.append((nc, nr))
    # solution by BFS
    start, goal = (0, 0), (cols - 1, rows - 1)
    prev = {start: None}; q = [start]
    while q:
        c, r = q.pop(0)
        for k, (dx, dy, _) in D.items():
            n = (c + dx, r + dy)
            if not walls[(c, r)][k] and n not in prev: prev[n] = (c, r); q.append(n)
    path = []; p = goal
    while p: path.append(p); p = prev[p]
    path.reverse()
    mx, my = 150, 320
    W, H = mx * 2 + cols * cell, my + 260 + rows * cell
    def draw(show):
        o = [f'<rect x="{mx-14}" y="{my-14}" width="{cols*cell+28}" height="{rows*cell+28}" rx="18" fill="#f4f8fc" stroke="none"/>']
        sw = max(6, cell // 7)
        for (c, r), w in walls.items():
            x, y = mx + c * cell, my + r * cell
            if w['n'] and (c, r) != start: o.append(f'<line x1="{x}" y1="{y}" x2="{x+cell}" y2="{y}"/>')
            if w['w']: o.append(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+cell}"/>')
            if c == cols - 1 and w['e']: o.append(f'<line x1="{x+cell}" y1="{y}" x2="{x+cell}" y2="{y+cell}"/>')
            if r == rows - 1 and w['s'] and (c, r) != goal: o.append(f'<line x1="{x}" y1="{y+cell}" x2="{x+cell}" y2="{y+cell}"/>')
        body = f'<g stroke="{GREEN}" stroke-width="{sw}" stroke-linecap="round">' + ''.join(o[1:]) + '</g>'
        out = o[0] + body
        if show:
            pts = ' '.join(f'{mx + c * cell + cell/2},{my + r * cell + cell/2}' for c, r in path)
            out += f'<polyline points="{mx + cell/2},{my - 40} {pts} {mx + (cols-0.5)*cell},{my + rows*cell + 40}" fill="none" stroke="{RED}" stroke-width="{sw+2}" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>'
        out += f'<image href="{png(KANIN)}" x="{mx + cell/2 - 125}" y="{my - 14 - 250*K_H/K_W}" width="250" height="{250*K_H/K_W:.0f}"/>'
        out += img('web/public/images/tryllegarden/pynt/hatt.webp', mx + (cols - 1) * cell - 70, my + rows * cell + 20, cell + 140, 200)
        return out
    save(name, draw(False), W, H); save(name + '-fasit', draw(True), W, H)
    print(name, f'{cols}x{rows}', 'path', len(path))

maze('labyrint-sma', 7, 9, 150)
maze('labyrint-store', 15, 19, 72)

# ---------- word search (big children): Christmas and magic words ----------
def wordsearch(name, N, words, dirs):
    grid = [[None] * N for _ in range(N)]; place = {}
    for w in sorted(words, key=len, reverse=True):
        for _ in range(5000):
            dy, dx = random.choice(dirs); y, x = random.randrange(N), random.randrange(N)
            cells = [(y + dy * i, x + dx * i) for i in range(len(w))]
            if not all(0 <= a < N and 0 <= b < N for a, b in cells): continue
            if all(grid[a][b] in (None, w[i]) for i, (a, b) in enumerate(cells)):
                for i, (a, b) in enumerate(cells): grid[a][b] = w[i]
                place[w] = cells; break
        else: sys.exit('could not place ' + w)
    letters = 'ABDEFGHIJKLMNOPRSTUVYÆØÅ'
    def count(g, w):
        n = 0
        for y in range(N):
            for x in range(N):
                for dy, dx in dirs:
                    cells = [(y + dy * i, x + dx * i) for i in range(len(w))]
                    if all(0 <= a < N and 0 <= b < N for a, b in cells) and all(g[a][b] == w[i] for i, (a, b) in enumerate(cells)): n += 1
        return n
    for _ in range(500):
        g2 = [[c or random.choice(letters) for c in row] for row in grid]
        if all(count(g2, w) == 1 for w in words): grid = g2; break
    else: sys.exit('fill failed')
    cs = 90; m = 40; W = N * cs + 2 * m
    def draw(show):
        o = [f'<rect x="10" y="10" width="{W-20}" height="{W-20}" rx="24" fill="{PAPER}" stroke="#7a5230" stroke-width="6"/>']
        if show:
            for w, cells in place.items():
                (a0, b0), (a1, b1) = cells[0], cells[-1]
                o.append(f'<line x1="{m+b0*cs+cs/2}" y1="{m+a0*cs+cs/2}" x2="{m+b1*cs+cs/2}" y2="{m+a1*cs+cs/2}" stroke="#f6c453" stroke-width="64" stroke-linecap="round" opacity=".75"/>')
        for y in range(N):
            for x in range(N):
                o.append(f'<text x="{m+x*cs+cs/2}" y="{m+y*cs+cs/2+22}" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="58" text-anchor="middle" fill="{INK}">{grid[y][x]}</text>')
        return ''.join(o)
    save(name, draw(False), W, W); save(name + '-fasit', draw(True), W, W)
    open(f'{OUT}/{name}-ord.txt', 'w').write('\n'.join(sorted(words)) + '\n')
    print(name, N, len(words))

wordsearch('ordsok-store', 13,
           ['TRYLLESTAV', 'TRYLLEHATT', 'KANIN', 'NISSE', 'JULETRE', 'PEPPERKAKE', 'STJERNE',
            'KORTSTOKK', 'MYNT', 'GRØT', 'BJELLE', 'GAVE', 'SNØ', 'HOKUSPOKUS'],
           [(0, 1), (1, 0), (1, 1), (-1, 1)])

# ---------- dot to dot ----------
def dots(name, pts, title_shape, r, fs, close=True, picture=None):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    W, H = max(xs) + 140, max(ys) + 140
    area = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    turn = 1 if area > 0 else -1   # which side is "outside" depends on the winding
    def draw(show):
        o = []
        if show and picture:
            href, px, py, pw, ph = picture
            o.append(f'<image href="{href}" x="{px}" y="{py}" width="{pw}" height="{ph}" opacity=".45"/>')
        if show:
            seq = pts + ([pts[0]] if close else [])
            o.append(f'<polyline points="{" ".join(f"{x},{y}" for x, y in seq)}" fill="none" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
        for i, (x, y) in enumerate(pts):
            o.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{INK}"/>')
            # put the number on the outside of the line, at right angles to it
            (ax, ay), (bx, by) = pts[i - 1], pts[(i + 1) % len(pts)]
            dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1
            nx, ny = turn * dy / L, -turn * dx / L
            d = r + fs * .85
            tx, ty = x + nx * d, y + ny * d + fs * .35
            o.append(f'<text x="{tx:.0f}" y="{ty:.0f}" font-family="DejaVu Sans, sans-serif" font-size="{fs}" text-anchor="middle" fill="{RED if i == 0 else INK}">{i+1}</text>')
        return ''.join(o)
    save(name, draw(False), W, H); save(name + '-fasit', draw(True), W, H)
    print(name, len(pts), 'punkter', title_shape)

# Small: a Christmas tree, 20 dots.
tree = [(600, 120), (760, 360), (680, 360), (860, 600), (760, 600), (980, 860), (650, 860), (650, 1000),
        (550, 1000), (550, 860), (220, 860), (440, 600), (340, 600), (520, 360), (440, 360)]
# densify the long edges a little so there are ~20 dots
def densify(p, n):
    out = []
    for i in range(len(p)):
        a, b = p[i], p[(i + 1) % len(p)]
        L = math.dist(a, b); k = max(1, round(L / n))
        out += [(a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k) for j in range(k)]
    return [(round(x), round(y)) for x, y in out]
dots('prikk-sma', densify(tree, 170), 'juletre', 14, 46)
# Big: the outline of the rabbit in the hat (from kanin-hatt.png).
def rabbit_outline(n_target, scale, ox, oy):
    import cv2
    a = cv2.imread(KANIN_HATT, cv2.IMREAD_UNCHANGED)[:, :, 3]
    a = cv2.GaussianBlur(a, (41, 41), 0)          # smooth away the fur
    cs, _ = cv2.findContours((a > 128).astype('uint8'), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)
    eps = 1.0
    while True:   # simplify until about n_target corners are left
        poly = cv2.approxPolyDP(c, eps, True)
        if len(poly) <= n_target: break
        eps *= 1.05
    pts = [(ox + p[0][0] * scale, oy + p[0][1] * scale) for p in poly]
    # drop corners that sit too close to the previous one (numbers would collide)
    kept = [pts[0]]
    for p in pts[1:]:
        if math.dist(p, kept[-1]) >= 70: kept.append(p)
    if math.dist(kept[-1], kept[0]) < 70: kept.pop()
    pts = densify(kept, 210)
    # start at the top of the left ear and go clockwise
    i0 = min(range(len(pts)), key=lambda i: pts[i][1] + pts[i][0] * .3)
    return pts[i0:] + pts[:i0]
S_DOT, OX, OY = 1.75, 90, 90
dots('prikk-store', rabbit_outline(40, S_DOT, OX, OY), 'kanin i tryllehatt', 10, 32,
     picture=(png(KANIN_HATT), OX, OY, KH_W * S_DOT, KH_H * S_DOT))

# ---------- find the two identical rabbits ----------
def twins(name, n, cols, traits, min_diff=1):
    keys = list(traits)
    def rnd(): return {k: random.choice(traits[k]) for k in keys}
    def dist(a, b): return sum(a[k] != b[k] for k in keys)
    while True:   # start over if the random picks paint themselves into a corner
        twin = rnd(); items = [twin, dict(twin)]; tries = 0
        while len(items) < n and tries < 5000:
            c = rnd(); tries += 1
            # every other rabbit differs from the twin and from all others by at least min_diff traits
            if all(dist(c, o) >= min_diff for o in items): items.append(c)
        if len(items) == n: break
    random.shuffle(items)
    pair = [i for i, it in enumerate(items) if dist(it, twin) == 0]
    cw, ch = 330, 420; rows = (n + cols - 1) // cols
    W, H = cols * cw, rows * ch
    def draw(show):
        o = [rabbit_defs()]
        for i, t in enumerate(items):
            x, y = (i % cols) * cw + cw / 2, (i // cols) * ch + ch / 2
            if show and i in pair:
                o.append(f'<rect x="{(i % cols) * cw + 12}" y="{(i // cols) * ch + 12}" width="{cw-24}" height="{ch-24}" rx="26" fill="none" stroke="{RED}" stroke-width="10"/>')
            o.append(rabbit_pic(x, y, .52, **t))
        return ''.join(o)
    save(name, draw(False), W, H); save(name + '-fasit', draw(True), W, H)
    open(f'{OUT}/{name}-fasit.txt', 'w').write(f'De like kaninene: nr. {pair[0]+1} og {pair[1]+1} (telt radvis fra øverst til venstre)\n')
    print(name, n, 'like:', [p + 1 for p in pair])

twins('kaniner-store', 20, 5, {
    'mirror': [False, True], 'bow': [None, RED, GREEN], 'band': [None, RED, GREEN],
    'star': [None, GOLD, RED], 'wand': [False, True], 'sparkle': [False, True],
})
twins('kaniner-sma', 12, 4, {
    'bow': [None, RED, GREEN], 'band': [None, RED], 'star': [None, GOLD], 'wand': [False, True], 'sparkle': [False, True],
}, min_diff=2)
