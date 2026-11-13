# Generates the word search, maze and QR codes in this folder (run from the repo root: python3 docs/pamflett/lag-oppgaver.py). Needs: pip install segno. Seeded, so the output is the same every time.
import random, segno, sys
random.seed(2026)
OUT = 'docs/pamflett'
# ---------- word search (forward directions only: right, down, down-right) ----------
N = 12
words = ['TRYLLE', 'NISSE', 'GRØT', 'BJELLE', 'STJERNE', 'TRIKS', 'LYKT', 'KANIN', 'LOCO', 'HATT']
dirs = [(0, 1), (1, 0), (1, 1)]
grid = [[None] * N for _ in range(N)]
place = {}
for w in sorted(words, key=len, reverse=True):
    for _ in range(2000):
        dy, dx = random.choice(dirs)
        y, x = random.randrange(N), random.randrange(N)
        ey, ex = y + dy * (len(w) - 1), x + dx * (len(w) - 1)
        if ey >= N or ex >= N: continue
        cells = [(y + dy * i, x + dx * i) for i in range(len(w))]
        if all(grid[a][b] in (None, w[i]) for i, (a, b) in enumerate(cells)):
            for i, (a, b) in enumerate(cells): grid[a][b] = w[i]
            place[w] = cells; break
    else: sys.exit('could not place ' + w)
letters = 'ABDEFGHIJKLMNOPRSTUVYÆØÅ'
def count(w):
    n = 0
    for y in range(N):
        for x in range(N):
            for dy, dx in dirs:
                cells = [(y + dy * i, x + dx * i) for i in range(len(w))]
                if all(0 <= a < N and 0 <= b < N for a, b in cells) and all(grid[a][b] == w[i] for i, (a, b) in enumerate(cells)): n += 1
    return n
for _ in range(500):
    g2 = [[c if c else random.choice(letters) for c in row] for row in grid]
    keep = grid; grid = g2
    if all(count(w) == 1 for w in words): break
    grid = keep
else: sys.exit('could not fill without duplicates')
solution = {c for cells in place.values() for c in cells}
def ws_svg(show):
    cs = 34; W = N * cs
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {W}" font-family="Georgia, serif" font-size="22" text-anchor="middle">', f'<rect width="{W}" height="{W}" fill="#fffdf6" stroke="#7a5230" stroke-width="3" rx="8"/>']
    for y in range(N):
        for x in range(N):
            if show and (y, x) in solution: o.append(f'<rect x="{x*cs+2}" y="{y*cs+2}" width="{cs-4}" height="{cs-4}" rx="8" fill="#f7d36b"/>')
            o.append(f'<text x="{x*cs+cs/2}" y="{y*cs+cs/2+8}" fill="#3a2a1a">{grid[y][x]}</text>')
    return '\n'.join(o + ['</svg>'])
open(f'{OUT}/ordsok.svg', 'w', encoding='utf-8').write(ws_svg(False))
open(f'{OUT}/ordsok-fasit.svg', 'w', encoding='utf-8').write(ws_svg(True))
# ---------- maze (recursive backtracker) ----------
M = 14
walls = [[[True] * 4 for _ in range(M)] for _ in range(M)]  # N E S W
seen = [[False] * M for _ in range(M)]
stack = [(0, 0)]; seen[0][0] = True
D = [(-1, 0, 0, 2), (0, 1, 1, 3), (1, 0, 2, 0), (0, -1, 3, 1)]
while stack:
    y, x = stack[-1]
    nb = [(y + dy, x + dx, a, b) for dy, dx, a, b in D if 0 <= y + dy < M and 0 <= x + dx < M and not seen[y + dy][x + dx]]
    if not nb: stack.pop(); continue
    ny, nx, a, b = random.choice(nb)
    walls[y][x][a] = False; walls[ny][nx][b] = False; seen[ny][nx] = True; stack.append((ny, nx))
# solution by BFS from top-left to bottom-right
from collections import deque
prev = {(0, 0): None}; q = deque([(0, 0)])
while q:
    y, x = q.popleft()
    for dy, dx, a, b in D:
        ny, nx = y + dy, x + dx
        if 0 <= ny < M and 0 <= nx < M and not walls[y][x][a] and (ny, nx) not in prev: prev[(ny, nx)] = (y, x); q.append((ny, nx))
path = []; c = (M - 1, M - 1)
while c: path.append(c); c = prev[c]
def maze_svg(show):
    cs = 34; W = M * cs + 20
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {W}">', f'<rect width="{W}" height="{W}" fill="#fffdf6"/>', '<g transform="translate(10 10)" stroke="#7a5230" stroke-width="4" stroke-linecap="round">']
    if show:
        pts = ' '.join(f'{x*cs+cs/2},{y*cs+cs/2}' for y, x in reversed(path))
        o.append(f'<polyline points="{pts}" fill="none" stroke="#d9423a" stroke-width="6" stroke-opacity=".8"/>')
    for y in range(M):
        for x in range(M):
            n, e, s, w = walls[y][x]
            X, Y = x * cs, y * cs
            if n and not (y == 0 and x == 0): o.append(f'<line x1="{X}" y1="{Y}" x2="{X+cs}" y2="{Y}"/>')
            if w: o.append(f'<line x1="{X}" y1="{Y}" x2="{X}" y2="{Y+cs}"/>')
            if s and y == M - 1 and x != M - 1: o.append(f'<line x1="{X}" y1="{Y+cs}" x2="{X+cs}" y2="{Y+cs}"/>')
            if e and x == M - 1 and not (y == M - 1): o.append(f'<line x1="{X+cs}" y1="{Y}" x2="{X+cs}" y2="{Y+cs}"/>')
    o.append('</g>')
    o.append(f'<text x="{10+cs/2}" y="{10+cs/2+8}" font-size="24" text-anchor="middle">🎅</text>')
    o.append(f'<text x="{10+(M-1)*cs+cs/2}" y="{10+(M-1)*cs+cs/2+8}" font-size="24" text-anchor="middle">🍚</text>')
    return '\n'.join(o + ['</svg>'])
open(f'{OUT}/labyrint.svg', 'w', encoding='utf-8').write(maze_svg(False))
open(f'{OUT}/labyrint-fasit.svg', 'w', encoding='utf-8').write(maze_svg(True))
# ---------- QR ----------
for name, url in (('qr-kort', 'https://www.tryllemuseet.no/tryllegarden'), ('qr-lang', 'https://www.tryllemuseet.no/barn/tryllegarden')):
    segno.make(url, error='m').save(f'{OUT}/{name}.svg', scale=8, border=3, dark='#1b1b2f')
print('path length', len(path))
print('\n'.join(' '.join(r) for r in grid))
print({w: (c[0], c[-1]) for w, c in place.items()})
