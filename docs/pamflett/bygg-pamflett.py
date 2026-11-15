#!/usr/bin/env python3
"""Builds the print-ready «Jul på Årvoll gård» pamphlet.

Run from the repo root:  python3 docs/pamflett/bygg-pamflett.py
Needs node with Playwright and Chromium (preinstalled in the cloud sessions).

Writes into docs/pamflett/:
  pamflett-trykk.html / .pdf     2 sheets A4 landscape, 3 mm bleed, crop and fold marks
                                 (outside: back | front, inside: page 2 | page 3)
  pamflett-lese.html / .pdf      4 pages A5 in reading order, no marks (for proofreading)

Edit the texts in PAGES below, rerun, and both PDFs are rebuilt. The puzzles and
QR codes come from lag-oppgaver.py (qr-aktiviteter.svg is made with segno too).
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
IMG = '../../web/public/images/tryllegarden'
PUB = '../../web/public'


def svg(name: str, strip_text: bool = False) -> str:
    s = (HERE / name).read_text(encoding='utf-8')
    if strip_text:
        s = re.sub(r'<text[^>]*>[^<]*</text>', '', s)
    return s


# ── page contents ─────────────────────────────────────────────────────────────
# The hens and eggs for task 3. The answer on the back is counted from this list.
COOP = [('h', 'hone-1'), ('e', 'egg-1'), ('e', 'egg-2'), ('h', 'hone-2'), ('e', 'egg-1'), ('e', 'egg-2'), ('h', 'hone-3'), ('e', 'egg-2')]
N_HENS = sum(1 for k, _ in COOP if k == 'h')
N_EGGS = sum(1 for k, _ in COOP if k == 'e')
COOP_HTML = ''.join(f'<img class="{k}" src="{IMG}/honsehus/{n}.webp" alt="">' for k, n in COOP)

FRONT = f'''
<div class="bg cover-bg"></div>
<div class="cover-top">
  <p class="kicker">Tryllemuseet · Jul 2026</p>
  <h1>Jul på<br>Årvoll gård</h1>
  <p class="sub">Fjøsnissens hemmelighet</p>
</div>
<div class="cover-kids">
  <img class="k1" src="{IMG}/figur/jente-hei.webp" alt="">
  <img class="k2" src="{IMG}/figur/nisse-vinker.webp" alt="">
  <img class="k3" src="{IMG}/figur/gutt-hei.webp" alt="">
</div>
<div class="cover-bottom">
  <p>Oppgaver og tryllekunster for store og små</p>
  <img class="logo" src="{PUB}/LOGO-bred.png" alt="Tryllemuseet">
</div>
'''

PAGE2 = f'''
<div class="bg paper"></div>
<div class="content">
  <h2>Hei, vi er Tiril og Trym</h2>
  <p>Hos oss på Tryllegården (Årvoll gård?) skjer det litt rare ting før jul. Noen har spist
  grøten, og noen har flettet manken til hesten. Vi tror det bor en nisse i
  fjøset. Vil du være med og lete?</p>
  <ol class="steps">
    <li><b>Løs oppgavene</b> her i heftet. Ta dem gjerne med deg rundt på gården, eller gjør dem hjemme.</li>
    <li><b>Spør en voksen</b> hvis du står fast.</li>
    <li><b>Skann koden</b> på baksiden og besøk oss i spillet Tryllegården.</li>
  </ol>
  <h3><span class="num">1</span> Labyrint: hjelp nissen til grøtfatet</h3>
  <div class="maze">
    {svg('labyrint.svg', strip_text=True)}
    <img class="m-start" src="{IMG}/ansikt/nisse.webp" alt="">
    <img class="m-end" src="{IMG}/kort/skal.webp" alt="">
  </div>
</div>
'''

PAGE3 = f'''
<div class="bg paper"></div>
<div class="content">
  <h3 class="first"><span class="num">2</span> Finn trylle- og juleordene</h3>
  <div class="ws">{svg('ordsok.svg')}</div>
  <p class="words">TRYLLE · NISSE · GRØT · BJELLE · STJERNE · TRIKS · LYKT · KANIN · LOCO · HATT</p>
  <p class="hint">Ordene står til høyre, nedover eller på skrå nedover.</p>

  <h3><span class="num">3</span> Hvor mange egg og høner?</h3>
  <div class="coop">{COOP_HTML}
  </div>
  <p class="count">Høner: <i></i> &nbsp;&nbsp; Egg: <i></i></p>

  <h3><span class="num">4</span> Tre julegåter</h3>
  <ul class="riddles">
    <li>Jeg har en hatt, men ikke noe hode. Hva er jeg?</li>
    <li>Jeg ringer, men har ingen munn. Hva er jeg?</li>
    <li>Jeg lyser, men blir kortere jo lenger jeg lyser. Hva er jeg?</li>
  </ul>
</div>
'''

BACK = f'''
<div class="bg back-bg"></div>
<div class="content back">
  <div class="game">
    <div class="qr">{svg('qr-lang.svg')}</div>
    <div>
      <h2>Spill Tryllegården</h2>
      <p>Besøk Tiril og Trym i fjøset, stallen og fuglehuset. Du løser små
      oppgaver og lærer et ekte tryllekunststykke på hvert sted. Det virker på
      mobil og nettbrett, uten innlogging.</p>
      <p class="url">tryllemuseet.no/barn/tryllegarden</p>
    </div>
  </div>

  <div class="rules">
    <h3>Tryllekunstnerens tre regler</h3>
    <p><b>1. Øv.</b> Gjør trikset mange ganger foran speilet.</p>
    <p><b>2. Ikke gjenta.</b> Vis ikke samme triks to ganger for de samme.</p>
    <p><b>3. Aldri avslør.</b> La publikum få lure litt!</p>
  </div>

  <div class="adults">
    <h3>Til voksne</h3>
    <p>La barnet øve i sitt eget tempo. Noen triks bruker saks eller små ting,
    så hjelp til. Vær et godt publikum: la deg overraske, og ikke avslør
    hvordan trikset virker.</p>
  </div>

  <div class="visit">
    <div class="qr small">{svg('qr-aktiviteter.svg')}</div>
    <div>
      <h3>Besøk Tryllemuseet</h3>
      <p>Åpent søndager kl. 12–15 på Årvoll gård, Årvollveien 35, 0590 Oslo.
      Gratis inngang.</p>
      <p>Kurs og forestillinger finner du i aktivitetsoversikten:<br>
      <span class="url">tryllemuseet.no/aktiviteter</span></p>
    </div>
  </div>

  <p class="answers"><b>Svar:</b> Oppgave 3: {N_HENS} høner og {N_EGGS} egg. Gåtene: sopp, bjelle, lys.</p>

  <div class="foot">
    <img class="logo" src="{PUB}/LOGO-bred.png" alt="Tryllemuseet">
    <p>post@tryllemuseet.no · tryllemuseet.no</p>
  </div>
</div>
'''

CSS = '''
:root { --burg:#6B0F1A; --burg-dk:#4A0A12; --gold:#D4A843; --gold-dk:#A07820; --cream:#FBF7EF; --cream-dk:#F0E8D8; --ink:#1A1208; --night:#14213d; }
* { box-sizing: border-box; margin: 0; }
html, body { background: #888; }
body { font-family: "Source Sans 3", "Liberation Sans", sans-serif; color: var(--ink); font-size: 10.6pt; line-height: 1.4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 148.5mm; height: 210mm; overflow: hidden; background: var(--cream); }
.print .page { overflow: visible; }
.bg { position: absolute; inset: -3mm 0 -3mm 0; z-index: 0; }
.print .L .bg { left: -3mm; } .print .R .bg { right: -3mm; }
.paper { background: var(--cream); }
.content { position: relative; z-index: 1; padding: 11mm 12mm 10mm; height: 100%; }
h1, h2, h3, .kicker, .sub { font-family: Cinzel, "DejaVu Serif", serif; }
h2 { font-size: 15pt; color: var(--burg); margin-bottom: 2.5mm; }
h3 { font-size: 11pt; color: var(--burg); margin: 6mm 0 2.4mm; display: flex; align-items: center; gap: 2.5mm; letter-spacing: .01em; }
h3.first { margin-top: 0; }
.num { display: inline-flex; width: 6.4mm; height: 6.4mm; border-radius: 50%; background: var(--gold); color: var(--burg-dk); align-items: center; justify-content: center; font-size: 9.5pt; font-weight: 700; flex: none; }
p + p { margin-top: 1.8mm; }
.steps { margin: 3.5mm 0 0; padding-left: 5mm; } .steps li { margin-bottom: 1.4mm; padding-left: 1mm; }

/* cover */
.cover-bg { background: #14213d url("%(img)s/scene/tunet.webp") 63%% 62%% / auto 118%% no-repeat; }
.cover-bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(74,10,18,.92) 0, rgba(74,10,18,.55) 32%%, rgba(20,33,61,0) 52%%, rgba(20,33,61,.35) 78%%, rgba(20,33,61,.82) 100%%); }
.cover-top { position: absolute; z-index: 2; top: 15mm; left: 0; right: 0; text-align: center; color: var(--cream); padding: 0 10mm; }
.kicker { font-size: 8.4pt; letter-spacing: .24em; text-transform: uppercase; color: var(--gold); }
h1 { font-size: 35pt; line-height: 1.04; margin: 4mm 0 3mm; color: #fff; text-shadow: 0 1.2mm 3mm rgba(0,0,0,.45); }
.sub { font-size: 14pt; color: var(--gold); letter-spacing: .05em; }
.cover-kids { position: absolute; z-index: 2; left: 0; right: 0; bottom: 31mm; height: 74mm; }
.cover-kids img { position: absolute; bottom: 0; height: 70mm; filter: drop-shadow(0 1.2mm 1.6mm rgba(0,0,0,.4)); }
.cover-kids .k1 { left: 18mm; } .cover-kids .k3 { right: 18mm; } .cover-kids .k2 { left: 50%%; transform: translateX(-50%%); height: 56mm; }
.cover-bottom { position: absolute; z-index: 2; left: 0; right: 0; bottom: 8mm; text-align: center; color: var(--cream); }
.cover-bottom p { font-size: 10.4pt; margin-bottom: 3.5mm; text-shadow: 0 .4mm 1.4mm rgba(0,0,0,.6); }
.logo { width: 62mm; display: block; margin: 0 auto; }

/* puzzles */
.maze { position: relative; width: 88mm; margin: 0 auto; }
.maze svg, .ws svg { display: block; width: 100%%; height: auto; }
.maze .m-start, .maze .m-end { position: absolute; width: 7.4%%; height: 7.4%%; object-fit: contain; top: 1.6%%; left: 1.6%%; }
.maze .m-end { top: auto; left: auto; bottom: 1.6%%; right: 1.6%%; }
.ws { width: 76mm; margin: 0 auto; }
.words { font-family: Cinzel, serif; font-size: 8.6pt; text-align: center; margin-top: 2mm; color: var(--burg); letter-spacing: .04em; }
.hint { text-align: center; font-size: 9pt; color: #5a4a3a; }
.coop { display: flex; align-items: flex-end; justify-content: center; gap: 1.6mm; height: 22mm; }
.coop .h { height: 21mm; } .coop .e { height: 9.5mm; }
.count { text-align: center; margin-top: 2mm; font-weight: 600; }
.count i { display: inline-block; width: 14mm; border-bottom: .3mm solid var(--ink); height: 4mm; vertical-align: bottom; }
.riddles { list-style: none; padding: 0; } .riddles li { padding: 1.3mm 0; border-bottom: .25mm dotted #b9a888; }

/* back */
.back-bg { background: var(--cream-dk); }
.back { display: flex; flex-direction: column; gap: 5.5mm; padding-top: 12mm; }
.game { display: flex; gap: 5mm; align-items: flex-start; }
.qr { flex: none; width: 40mm; background: #fff; padding: 2mm; border-radius: 3mm; border: .4mm solid var(--gold-dk); } .qr svg { display: block; width: 100%%; height: auto; }
.qr.small { width: 27mm; padding: 1.2mm; }
.url { font-weight: 700; color: var(--burg); font-size: 9.6pt; white-space: nowrap; display: inline-block; }
.back h3 { margin: 0 0 1.5mm; font-size: 10.6pt; }
.rules, .adults { background: #fff; border-left: 1.2mm solid var(--gold); border-radius: 0 2mm 2mm 0; padding: 2.4mm 3.4mm; }
.visit { display: flex; gap: 4mm; align-items: flex-start; }
.answers { font-size: 8.6pt; color: #5a4a3a; border-top: .25mm solid #b9a888; padding-top: 2mm; }
.foot { margin-top: auto; text-align: center; font-size: 9pt; } .foot .logo { width: 56mm; margin-bottom: 2mm; }

/* layouts */
.read .page { page-break-after: always; margin: 0 auto; }
.read { background: #fff; }
.print .sheet { position: relative; width: 321mm; height: 234mm; background: #fff; overflow: hidden; page-break-after: always; }
.print .sheet .page { position: absolute; top: 12mm; }
.print .sheet .L { left: 12mm; } .print .sheet .R { left: 160.5mm; }
.mark { position: absolute; background: #000; }
@page { margin: 0; }
'''


def doc(mode: str) -> str:
    css = CSS.replace('%%', '%').replace('%(img)s', IMG)
    pg = lambda cls, body: f'<section class="page {cls}">{body}</section>'
    if mode == 'lese':
        css += '@page { size: 148.5mm 210mm; }'
        body = pg('', FRONT) + pg('', PAGE2) + pg('', PAGE3) + pg('', BACK)
        return f'<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>Jul på Årvoll gård (lesekopi)</title>{head(css)}</head><body class="read">{body}</body></html>'
    css += '@page { size: 321mm 234mm; }'
    marks = []
    t, b, l, r = 12, 222, 12, 309   # trim box edges (mm) inside the 321 × 234 sheet
    fold = 160.5
    for x in (l, r):
        for y0, y1 in ((3, 8), (b + 4, b + 9)):       # vertical ticks above and below the trim corners
            marks.append(f'<span class="mark" style="left:{x-.1}mm;top:{y0}mm;width:.2mm;height:{y1-y0}mm"></span>')
    for y in (t, b):
        for x0, x1 in ((3, 8), (r + 4, r + 9)):
            marks.append(f'<span class="mark" style="top:{y-.1}mm;left:{x0}mm;height:.2mm;width:{x1-x0}mm"></span>')
    for y0 in (3, b + 4):                              # fold marks, dashed look via short ticks
        marks.append(f'<span class="mark" style="left:{fold-.1}mm;top:{y0}mm;width:.2mm;height:5mm"></span>')
    m = ''.join(marks)
    s1 = f'<div class="sheet">{m}{pg("L", BACK)}{pg("R", FRONT)}</div>'
    s2 = f'<div class="sheet">{m}{pg("L", PAGE2)}{pg("R", PAGE3)}</div>'
    return f'<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>Jul på Årvoll gård (trykk)</title>{head(css)}</head><body class="print">{s1}{s2}</body></html>'


def head(css: str) -> str:
    return ('<link rel="preconnect" href="https://fonts.googleapis.com">'
            '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet">'
            f'<style>{css}</style>')


def main() -> None:
    import subprocess
    for mode in ('trykk', 'lese'):
        (HERE / f'pamflett-{mode}.html').write_text(doc(mode), encoding='utf-8')
    subprocess.run(['node', str(HERE / 'lag-pdf.mjs')], check=True)


if __name__ == '__main__':
    main()
