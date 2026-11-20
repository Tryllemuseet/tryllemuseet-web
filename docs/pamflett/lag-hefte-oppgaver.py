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

# ---------- the magic rabbit (drawn, so it can vary) ----------
def rabbit(x, y, s=1, ear_l=-12, ear_r=12, fold=None, bow=None, hat=None, carrot=False,
           spot=None, wink=False, tooth=True, star=False):
    g = [f'<g transform="translate({x},{y}) scale({s})" stroke="{INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">']
    def ear(angle, side, folded):
        ex = -26 if side < 0 else 26
        inner = f'<ellipse cx="0" cy="-70" rx="9" ry="34" fill="#f6c9cf" stroke="none"/>'
        if folded:
            return (f'<g transform="translate({ex},-60) rotate({angle})"><path d="M-17 0 C-20 -60 18 -60 17 0 Z" fill="#fff"/>'
                    f'<path d="M-12 -46 C 0 -70 30 -60 40 -40 C 28 -34 10 -40 -2 -44 Z" fill="#fff"/></g>')
        return (f'<g transform="translate({ex},-60) rotate({angle})"><ellipse cx="0" cy="-60" rx="18" ry="58" fill="#fff"/>'
                f'{inner}</g>')
    g.append(ear(ear_l, -1, fold == 'l'))
    g.append(ear(ear_r, 1, fold == 'r'))
    g.append('<ellipse cx="0" cy="70" rx="58" ry="62" fill="#fff"/>')               # body
    if spot == 'body': g.append('<ellipse cx="22" cy="78" rx="18" ry="14" fill="#c9b8a6" stroke="none"/>')
    g.append('<circle cx="0" cy="-10" r="52" fill="#fff"/>')                          # head
    if spot == 'head': g.append('<ellipse cx="-24" cy="-26" rx="15" ry="12" fill="#c9b8a6" stroke="none"/>')
    if wink:
        g.append('<path d="M-28 -16 q9 -8 18 0" fill="none"/>')
    else:
        g.append(f'<circle cx="-19" cy="-16" r="7" fill="{INK}" stroke="none"/>')
    g.append(f'<circle cx="19" cy="-16" r="7" fill="{INK}" stroke="none"/>')
    g.append(f'<ellipse cx="0" cy="4" rx="8" ry="6" fill="#e88a9a"/>')                # nose
    g.append('<path d="M0 10 v8 M0 18 q-10 8 -18 0 M0 18 q10 8 18 0" fill="none"/>')
    if tooth: g.append('<rect x="-6" y="20" width="12" height="11" rx="2" fill="#fff" stroke-width="3"/>')
    for sx in (-1, 1):
        g.append(f'<path d="M{sx*26} 8 l{sx*30} -6 M{sx*26} 14 l{sx*32} 4" fill="none" stroke-width="3"/>')
    g.append('<ellipse cx="-30" cy="128" rx="22" ry="12" fill="#fff"/><ellipse cx="30" cy="128" rx="22" ry="12" fill="#fff"/>')  # feet
    if bow:
        g.append(f'<path d="M0 42 l-22 -12 v24 Z M0 42 l22 -12 v24 Z" fill="{bow}"/><circle cx="0" cy="42" r="6" fill="{bow}"/>')
    if hat:
        g.append(f'<g transform="translate(0,-58)"><rect x="-38" y="-6" width="76" height="12" rx="4" fill="{hat}"/>'
                 f'<rect x="-24" y="-52" width="48" height="48" rx="4" fill="{hat}"/>'
                 f'<rect x="-24" y="-20" width="48" height="9" fill="{RED if hat == INK else GOLD}" stroke="none"/></g>')
    if star:
        g.append(f'<path d="M58 -60 l6 13 14 2 -10 10 3 14 -13 -7 -13 7 3 -14 -10 -10 14 -2 Z" fill="{GOLD}" stroke-width="3"/>')
    if carrot:
        g.append(f'<g transform="translate(-60,80) rotate(-25)"><path d="M0 0 L12 -60 L24 0 Z" fill="#ef8a2c"/>'
                 f'<path d="M12 -60 l-8 -16 M12 -60 l0 -18 M12 -60 l8 -16" stroke="{GREEN}" stroke-width="5" fill="none"/></g>')
    g.append('</g>')
    return ''.join(g)

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
        out += rabbit(mx + cell / 2, my - 150, .9)
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
def dots(name, pts, title_shape, r, fs, close=True):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    W, H = max(xs) + 140, max(ys) + 140
    def draw(show):
        o = []
        if show:
            seq = pts + ([pts[0]] if close else [])
            o.append(f'<polyline points="{" ".join(f"{x},{y}" for x, y in seq)}" fill="none" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>')
        for i, (x, y) in enumerate(pts):
            o.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{INK}"/>')
            # put the number outside the shape, away from the centre
            cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
            a = math.atan2(y - cy, x - cx); tx, ty = x + math.cos(a) * (r + fs * .8), y + math.sin(a) * (r + fs * .8) + fs * .35
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
# Big: a rabbit peeping out of the magic hat, ~48 dots.
hat_rabbit = [(470, 700), (470, 1060), (300, 1080), (300, 1130), (900, 1130), (900, 1080), (730, 1060), (730, 700),
              (700, 640), (720, 560), (760, 420), (790, 260), (770, 160), (720, 150), (680, 230),
              (655, 380), (645, 475), (555, 475), (545, 380), (520, 230), (480, 150), (430, 160),
              (410, 260), (440, 420), (480, 560), (500, 640)]
dots('prikk-store', densify(hat_rabbit, 85), 'kanin i tryllehatt', 10, 34)

# ---------- find the two identical rabbits ----------
def twins(name, n, cols, traits, min_diff=1):
    keys = list(traits)
    def rnd(): return {k: random.choice(traits[k]) for k in keys}
    def dist(a, b): return sum(a[k] != b[k] for k in keys)
    twin = rnd(); items = [twin, dict(twin)]
    while len(items) < n:
        c = rnd()
        # every other rabbit differs from the twin and from all others by at least min_diff traits
        if all(dist(c, o) >= min_diff for o in items): items.append(c)
    random.shuffle(items)
    pair = [i for i, it in enumerate(items) if dist(it, twin) == 0]
    cw, ch = 330, 420; rows = (n + cols - 1) // cols
    W, H = cols * cw, rows * ch
    def draw(show):
        o = []
        for i, t in enumerate(items):
            x, y = (i % cols) * cw + cw / 2, (i // cols) * ch + 210
            if show and i in pair:
                o.append(f'<rect x="{(i % cols) * cw + 12}" y="{(i // cols) * ch + 12}" width="{cw-24}" height="{ch-24}" rx="26" fill="none" stroke="{RED}" stroke-width="10"/>')
            o.append(rabbit(x, y, .85, **t))
        return ''.join(o)
    save(name, draw(False), W, H); save(name + '-fasit', draw(True), W, H)
    open(f'{OUT}/{name}-fasit.txt', 'w').write(f'De like kaninene: nr. {pair[0]+1} og {pair[1]+1} (telt radvis fra øverst til venstre)\n')
    print(name, n, 'like:', [p + 1 for p in pair])

twins('kaniner-store', 20, 5, {
    'ear_l': [-14, -4], 'ear_r': [14, 4], 'fold': [None, 'l', 'r'], 'bow': [None, RED, GREEN],
    'hat': [None, INK], 'carrot': [False, True], 'wink': [False, True], 'spot': [None, 'head', 'body'],
})
twins('kaniner-sma', 12, 4, {
    'fold': [None, 'r'], 'bow': [None, RED, GREEN], 'hat': [None, INK], 'carrot': [False, True], 'star': [False, True],
}, min_diff=2)
