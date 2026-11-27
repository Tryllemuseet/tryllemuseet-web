#!/usr/bin/env python3
"""Builds the two A5 activity booklets «Jul på Årvoll gård» for children.

  hefte-sma.pdf    4–6 years, 8 pages A5
  hefte-store.pdf  7–10 years, 8 pages A5

Run from the repo root:  python3 docs/pamflett/bygg-hefter.py
The puzzle pictures come from lag-hefte-oppgaver.py, lag-finn-feil.py and
lag-skygge.py (all in docs/pamflett/hefter/); rerun those first if a puzzle
changed. The PDFs are in reading order, one A5 page per PDF page: print them as
a booklet (A4 landscape, double-sided, folded) from the printer's booklet mode.
Needs node with Playwright and Chromium (preinstalled in the cloud sessions).
"""
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
H = 'hefter'
IMG = '../../web/public/images/tryllegarden'
PUB = '../../web/public'


def svg(name: str) -> str:
    return (HERE / name).read_text(encoding='utf-8')


def fasit(path: Path) -> str:
    return (HERE / path).read_text(encoding='utf-8').strip().split(':', 1)[-1].strip()


def page(body: str, cls: str = '') -> str:
    return f'<section class="page {cls}"><div class="content">{body}</div></section>'


def task(n: int, title: str, text: str, inner: str) -> str:
    return page(f'<h2><span class="num">{n}</span>{title}</h2><p class="lead">{text}</p><div class="fill">{inner}</div>')


def cover(age: str, sub: str) -> str:
    return f'''<section class="page cover"><div class="cover-bg"></div>
<div class="cover-top"><p class="kicker">Tryllemuseet · Jul 2026</p><h1>Jul på<br>Årvoll gård</h1>
<p class="sub">{sub}</p></div>
<div class="age">Oppgavehefte for {age}</div>
<div class="cover-bottom"><p>Hjelp tryllekaninen, nissen, Tiril og Trym!</p>
<img class="logo" src="{PUB}/LOGO-bred.png" alt="Tryllemuseet"></div></section>'''


def back(answers: str) -> str:
    return page(f'''<h2 class="small">Fasit</h2>
<p class="lead">For voksne, eller for den som har prøvd skikkelig først.</p>
{answers}
<div class="game"><div class="qr">{svg('qr-lang.svg')}</div>
<div><h3>Spill Tryllegården</h3><p>Lær ekte tryllekunster sammen med Tiril, Trym og nissen.</p>
<p class="url">tryllemuseet.no/barn/tryllegarden</p></div></div>
<div class="foot"><img class="logo" src="{PUB}/LOGO-bred.png" alt="Tryllemuseet">
<p>Årvoll gård, Årvollveien 35, 0590 Oslo · tryllemuseet.no</p></div>''', 'backpage')


def spot(size: str, n: int) -> str:
    return (f'<img class="pic" src="{H}/finn-feil-{size}-a.png" alt="">'
            f'<img class="pic" src="{H}/finn-feil-{size}-b.png" alt="">'
            f'<p class="tally">Kryss av for hver feil du finner: {"○ " * n}</p>')


def answers_grid(items: list[tuple[str, str]], notes: str) -> str:
    cells = ''.join(f'<figure><img src="{H}/{f}" alt=""><figcaption>{c}</figcaption></figure>' for f, c in items)
    return f'<div class="answers">{cells}</div><p class="notes">{notes}</p>'


def small() -> list[str]:
    return [
        cover('4–6 år', 'Kaninens julejakt'),
        task(1, 'Finn nissens skygge', 'Nissen har mistet skyggen sin. Hvilken av de svarte skyggene er hans?',
             f'<img class="pic tall" src="{H}/skygge-sma.png" alt="">'),
        task(2, 'Finn 5 feil', 'Bildene i bakstehuset er nesten like. Finner du de 5 forskjellene?', spot('sma', 5)),
        task(3, 'Hjelp kaninen hjem', 'Tryllekaninen skal hjem i hatten før jul. Finn veien!',
             f'<img class="pic tall" src="{H}/labyrint-sma.png" alt="">'),
        task(4, 'Tegn fra prikk til prikk', 'Start på den røde 1-eren og tegn videre til 23. Hva blir det? Fargelegg etterpå!',
             f'<img class="pic" src="{H}/prikk-sma.png" alt="">'),
        task(5, 'Finn to like kaniner', 'Bare to av kaninene er helt like. Se på sløyfen, hatten og stjernen!',
             f'<img class="pic" src="{H}/kaniner-sma.png" alt="">'),
        task(6, 'Tegn din egen tryllekunstner', 'Tegn deg selv med tryllehatt og tryllestav. Hva tryller du fram?',
             '<div class="frame"></div>'),
        back(answers_grid([
            ('finn-feil-sma-fasit.png', 'Finn 5 feil'), ('labyrint-sma-fasit.png', 'Labyrinten'),
            ('kaniner-sma-fasit.png', f'Like kaniner: {fasit(Path(H) / "kaniner-sma-fasit.txt")}'),
        ], f'<b>Skyggen:</b> {fasit(Path(H) / "skygge-sma-fasit.txt")}. <b>Prikk til prikk:</b> et juletre.')),
    ]


def big() -> list[str]:
    words = ' · '.join((HERE / H / 'ordsok-store-ord.txt').read_text(encoding='utf-8').split())
    return [
        cover('7–10 år', 'Store tryllejakten'),
        task(1, 'Finn nissens skygge', 'Bare én av de seks skyggene er nissens. Se nøye: noen mangler bare en liten bit!',
             f'<img class="pic tall" src="{H}/skygge-store.png" alt="">'),
        task(2, 'Finn 8 feil', 'Noen har trylla i stua. Finn de 8 forskjellene mellom bildene. Noen er veldig små!', spot('store', 8)),
        task(3, 'Kaninens lange vei hjem', 'Tryllekaninen skal hjem til hatten før jul. Det er mange blindveier!',
             f'<img class="pic tall" src="{H}/labyrint-store.png" alt="">'),
        task(4, 'Finn ordene', 'Ordene står bortover, nedover og på skrå. Kryss av når du finner dem.',
             f'<img class="pic" src="{H}/ordsok-store.png" alt=""><p class="words">{words}</p>'),
        task(5, 'Tegn fra prikk til prikk', 'Start på den røde 1-eren og tegn videre til 31. Hvem er det?',
             f'<img class="pic" src="{H}/prikk-store.png" alt="">'),
        task(6, 'Finn to like kaniner', 'Bare to av de 20 kaninene er helt like. Se på sløyfe, hattebånd, stjerne, tryllestav, glitter og hvilken vei de ser!',
             f'<img class="pic" src="{H}/kaniner-store.png" alt="">'),
        back(answers_grid([
            ('finn-feil-store-fasit.png', 'Finn 8 feil'), ('labyrint-store-fasit.png', 'Labyrinten'),
            ('ordsok-store-fasit.png', 'Ordene'),
            ('kaniner-store-fasit.png', f'Like kaniner: {fasit(Path(H) / "kaniner-store-fasit.txt")}'),
        ], f'<b>Skyggen:</b> {fasit(Path(H) / "skygge-store-fasit.txt")}. <b>Prikk til prikk:</b> tryllekaninen i hatten.')),
    ]


CSS = '''
:root { --burg:#6B0F1A; --burg-dk:#4A0A12; --gold:#D4A843; --gold-dk:#A07820; --cream:#FBF7EF; --cream-dk:#F0E8D8; --ink:#1A1208; }
* { box-sizing: border-box; margin: 0; }
html, body { background: #fff; }
body { font-family: "Source Sans 3", "Liberation Sans", sans-serif; color: var(--ink); font-size: 11pt; line-height: 1.35;
       -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@page { size: 148.5mm 210mm; margin: 0; }
.page { position: relative; width: 148.5mm; height: 210mm; overflow: hidden; background: #fff; page-break-after: always; }
.content { position: relative; z-index: 1; padding: 10mm 11mm 9mm; height: 100%; display: flex; flex-direction: column; }
h1, h2, h3, .kicker, .sub, .age { font-family: Cinzel, "DejaVu Serif", serif; }
h2 { font-size: 15pt; color: var(--burg); display: flex; align-items: center; gap: 3mm; line-height: 1.15; }
h2.small { font-size: 13pt; }
h3 { font-size: 11pt; color: var(--burg); margin-bottom: 1mm; }
.num { display: inline-flex; width: 8mm; height: 8mm; border-radius: 50%; background: var(--gold); color: var(--burg-dk);
       align-items: center; justify-content: center; font-size: 12pt; font-weight: 700; flex: none; }
.lead { margin: 2mm 0 3mm; font-size: 11.5pt; }
.fill { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm; }
.pic { display: block; max-width: 100%; max-height: 100%; min-height: 0; object-fit: contain; }
.fill .pic { flex: 1 1 0; width: 100%; }
.tally { font-size: 12pt; color: var(--burg); letter-spacing: .05em; flex: none; }
.words { font-family: Cinzel, serif; font-size: 9.5pt; text-align: center; color: var(--burg); letter-spacing: .03em; flex: none; line-height: 1.5; }
.frame { flex: 1; width: 100%; border: .8mm dashed var(--gold-dk); border-radius: 5mm; }

/* cover */
.cover-bg { position: absolute; inset: 0; background: #14213d url("%(img)s/jul-laven.webp") 45%% 50%% / auto 100%% no-repeat; }
.cover-bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(74,10,18,.94) 0, rgba(74,10,18,.6) 30%%, rgba(20,33,61,0) 48%%, rgba(20,33,61,0) 70%%, rgba(20,33,61,.85) 100%%); }
.cover-top { position: absolute; z-index: 2; top: 14mm; left: 0; right: 0; text-align: center; color: #fff; padding: 0 10mm; }
.kicker { font-size: 8.4pt; letter-spacing: .24em; text-transform: uppercase; color: var(--gold); }
h1 { font-size: 34pt; line-height: 1.04; margin: 4mm 0 3mm; color: #fff; text-shadow: 0 1.2mm 3mm rgba(0,0,0,.45); }
.sub { font-size: 14pt; color: var(--gold); letter-spacing: .05em; }
.age { position: absolute; z-index: 2; right: 8mm; top: 92mm; background: var(--gold); color: var(--burg-dk); font-weight: 700;
       font-size: 11pt; padding: 2.5mm 4mm; border-radius: 3mm; transform: rotate(-4deg); box-shadow: 0 1mm 2mm rgba(0,0,0,.35); }
.cover-bottom { position: absolute; z-index: 2; left: 0; right: 0; bottom: 8mm; text-align: center; color: var(--cream); }
.cover-bottom p { font-size: 11pt; margin-bottom: 3.5mm; text-shadow: 0 .4mm 1.4mm rgba(0,0,0,.6); }
.logo { width: 58mm; display: block; margin: 0 auto; }

/* back page with answers */
.backpage .content { background: var(--cream); gap: 2.5mm; }
.backpage .lead { margin: 0; font-size: 9.5pt; color: #5a4a3a; }
.answers { display: flex; flex-wrap: wrap; gap: 2.5mm; justify-content: center; align-items: flex-end; }
.answers figure { flex: 0 0 auto; text-align: center; }
.answers img { display: block; height: 50mm; max-width: 72mm; object-fit: contain; background: #fff; border: .25mm solid #d8ccb6; margin: 0 auto; }
.answers figcaption { font-size: 8pt; color: #5a4a3a; margin-top: .8mm; }
.notes { font-size: 9pt; text-align: center; }
.game { display: flex; gap: 4mm; align-items: center; background: #fff; border-left: 1.2mm solid var(--gold); border-radius: 0 2mm 2mm 0; padding: 2.4mm 3.4mm; margin-top: auto; font-size: 9.5pt; }
.qr { flex: none; width: 24mm; } .qr svg { display: block; width: 100%; height: auto; }
.url { font-weight: 700; color: var(--burg); white-space: nowrap; }
.foot { text-align: center; font-size: 8.6pt; } .foot .logo { width: 44mm; margin-bottom: 1.5mm; }
'''


def doc(title: str, pages: list[str]) -> str:
    css = CSS.replace('%%', '%').replace('%(img)s', IMG)
    return ('<!doctype html><html lang="nb"><head><meta charset="utf-8">'
            f'<title>{title}</title>'
            '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">'
            f'<style>{css}</style></head><body>{"".join(pages)}</body></html>')


JS = r'''
const { createRequire } = require('node:module')
let chromium
try { ({ chromium } = require('playwright')) } catch { ({ chromium } = createRequire('/')('playwright')) }
;(async () => {
  const browser = await chromium.launch()
  for (const name of process.argv.slice(1)) {
    const page = await browser.newPage()
    await page.goto('file://' + name + '.html', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const over = await page.$$eval('.content', els => els.map((e, i) => [i + 1, e.scrollHeight - e.clientHeight]).filter(x => x[1] > 1))
    if (over.length) console.log(name, 'OVERFLOW (page, px):', JSON.stringify(over))
    await page.pdf({ path: name + '.pdf', width: '148.5mm', height: '210mm', printBackground: true, preferCSSPageSize: true })
    console.log('wrote', name + '.pdf')
  }
  await browser.close()
})()
'''


def main() -> None:
    names = []
    for slug, title, pages in (('hefte-sma', 'Jul på Årvoll gård – oppgavehefte 4–6 år', small()),
                               ('hefte-store', 'Jul på Årvoll gård – oppgavehefte 7–10 år', big())):
        (HERE / f'{slug}.html').write_text(doc(title, pages), encoding='utf-8')
        names.append(str(HERE / slug))
    subprocess.run(['node', '-e', JS, *names], check=True)


if __name__ == '__main__':
    main()
