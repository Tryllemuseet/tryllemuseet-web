#!/usr/bin/env node
// Operations tool for the voice lines in "Tryllegården".
//
//   node scripts/tryllegarden-audio.mjs list [--lang=nb|en] [--season=jul]
//       Writes docs/tryllegarden-lyd/replikker-<lang>.md and .json: every line
//       the voices say, with id, speaker, context and the exact words.
//   node scripts/tryllegarden-audio.mjs import <folder> [--variant=v1] [--pick=<id>:v2,<id>:v3] [--lang=nb]
//       Copies <id>_<variant>.mp3 from a delivery folder to
//       web/public/audio/tryllegarden/<lang>/<id>.mp3 (default variant v1,
//       --pick overrides it per line), then runs build.
//   node scripts/tryllegarden-audio.mjs build
//       Scans web/public/audio/tryllegarden/<lang>/<id>.<ext>, writes
//       manifest.json, and reports lines without a clip and clips whose line
//       no longer exists.
//
// Reads the built-in season pack only. Lines edited in Studio get a new id and
// therefore fall back to speech synthesis until they are recorded again.
// See docs/tryllegarden-lyd/README.md.
import { readdirSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'
import { BUILT_IN_SEASONS } from '../web/src/lib/tryllegardenSeason.ts'
import { audioKey, audioText } from '../web/src/lib/tryllegardenAudio.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const AUDIO_DIR = join(root, 'web/public/audio/tryllegarden')
const OUT_DIR = join(root, 'docs/tryllegarden-lyd')
const NAMES = { jente: 'Tiril', gutt: 'Trym', gard: 'Tryllegården' }
const AUDIO_EXT = new Set(['.mp3', '.m4a', '.ogg', '.opus', '.wav', '.webm'])

const [cmd = 'list', ...rest] = process.argv.slice(2)
const opt = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')))
const lang = opt.lang === 'en' ? 'en' : 'nb'
const seasonKey = opt.season ?? 'jul'

const fill = s => String(s ?? '').replace(/\{jente\}/g, NAMES.jente).replace(/\{gutt\}/g, NAMES.gutt).replace(/\{gard\}/g, NAMES.gard)

/** All lines the game says with a voice, in play order. */
export function collectLines(season, lang) {
  const pick = (o, f) => fill((lang === 'en' && o[f + 'En']) || o[f] || '')
  const out = []
  const add = (who, text, where, kind, extra = {}) => {
    const t = audioText(text)
    if (t) out.push({ who, text: t, where, kind, ...extra })
  }
  add('forteller', pick(season, 'intro'), 'Startsiden', 'intro')
  for (const p of season.places) {
    const place = pick(p, 'title') || p.key
    for (const l of p.intro ?? []) add(l.who, pick(l, 'text'), place, 'samtale', { pose: l.pose })
    add('forteller', pick(p, 'task'), place, 'oppgave')
    const hints = (lang === 'en' && p.hintsEn?.length ? p.hintsEn : p.hints ?? [])
    hints.forEach((h, i) => add('nisse', fill(h), place, `hint ${i + 1}`))
    for (const c of p.clues ?? []) add('forteller', pick(c, 'text'), place, 'gåte')
    for (const it of p.items ?? []) if (it.wrong) add('gutt', pick(it, 'wrong'), place, 'feil svar')
    add('jente', pick(p, 'done'), place, 'ferdig', { pose: 'jubler' })
    add('forteller', lang === 'en' ? 'Did you know …' : 'Visste du at …', place, 'tradisjon')
    add('forteller', pick(p, 'traditionShort'), place, 'tradisjon')
    add('forteller', pick(p, 'traditionLong'), place, 'tradisjon (lang)')
  }
  for (const l of season.finale ?? []) add(l.who, pick(l, 'text'), 'Finalen', 'samtale', { pose: l.pose })
  // The same words said in several places need one clip only.
  const seen = new Set()
  return out.filter(l => (seen.has(l.text) ? false : seen.add(l.text))).map((l, i, all) => ({
    id: audioKey(lang, l.text), n: i + 1, ...l, before: all[i - 1]?.text ?? '',
  }))
}

function checkUnique(lines) {
  const ids = new Map()
  for (const l of lines) {
    if (ids.has(l.id)) throw new Error(`Duplicate id ${l.id}: «${ids.get(l.id)}» and «${l.text}»`)
    ids.set(l.id, l.text)
  }
}

const season = BUILT_IN_SEASONS[seasonKey]
if (!season) { console.error(`No built-in season «${seasonKey}»`); process.exit(1) }
const lines = collectLines(season, lang)
checkUnique(lines)

if (cmd === 'list') {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, `replikker-${lang}.json`), JSON.stringify({ season: seasonKey, lang, names: NAMES, lines }, null, 2) + '\n')
  const esc = s => s.replace(/\|/g, '\\|')
  const md = [
    `# Replikker: ${seasonKey} (${lang})`,
    '',
    `Laget av \`scripts/tryllegarden-audio.mjs list\`. ${lines.length} replikker, ${lines.reduce((n, l) => n + l.text.length, 0)} tegn.`,
    'Les teksten ordrett. `id` er filnavnet (se brief.md).',
    '',
    '| # | id | Hvem | Hvor | Type | Tekst |',
    '|---|---|---|---|---|---|',
    ...lines.map(l => `| ${l.n} | \`${l.id}\` | ${l.who} | ${esc(l.where)} | ${esc(l.kind)}${l.pose ? ` (${l.pose})` : ''} | ${esc(l.text)} |`),
    '',
  ].join('\n')
  writeFileSync(join(OUT_DIR, `replikker-${lang}.md`), md)
  const byWho = {}
  for (const l of lines) { byWho[l.who] ??= { n: 0, c: 0 }; byWho[l.who].n++; byWho[l.who].c += l.text.length }
  console.log(`${lines.length} lines, ${lines.reduce((n, l) => n + l.text.length, 0)} characters`)
  console.table(byWho)
} else if (cmd === 'import') {
  const dir = rest.find(a => !a.startsWith('--'))
  if (!dir || !existsSync(dir)) { console.error('Usage: import <folder> [--variant=v1] [--pick=id:v2,...]'); process.exit(1) }
  const variant = opt.variant ?? 'v1'
  const picks = Object.fromEntries((opt.pick ?? '').split(',').filter(Boolean).map(x => x.split(':')))
  const known = new Set(lines.map(l => l.id))
  const out = join(AUDIO_DIR, lang)
  mkdirSync(out, { recursive: true })
  const files = new Set(readdirSync(dir))
  const ids = [...new Set([...files].map(f => /^([0-9a-z]{7})_v\d\.\w+$/.exec(f)?.[1]).filter(Boolean))]
  let n = 0
  for (const id of ids) {
    if (!known.has(id)) { console.log(`Skipped ${id}: no such line in the game (the text has changed?)`); continue }
    const v = picks[id] ?? variant
    const f = [...files].find(x => x.startsWith(`${id}_${v}.`))
    if (!f) { console.log(`Skipped ${id}: no ${v} file`); continue }
    copyFileSync(join(dir, f), join(out, `${id}${extname(f)}`))
    n++
  }
  console.log(`Copied ${n} clips to ${out}`)
  process.argv[2] = 'build'
  await import(`${import.meta.url}?build`)
} else if (cmd === 'build') {
  const manifest = { version: 1, lines: {} }
  const stale = []
  for (const l of ['nb', 'en']) {
    const dir = join(AUDIO_DIR, l)
    if (!existsSync(dir)) continue
    const ids = new Set(collectLines(season, l).map(x => x.id))
    for (const f of readdirSync(dir)) {
      if (!AUDIO_EXT.has(extname(f).toLowerCase())) continue
      const id = f.slice(0, f.length - extname(f).length)
      if (ids.has(id)) manifest.lines[id] = `${l}/${f}`
      else stale.push(`${l}/${f}`)
    }
  }
  writeFileSync(join(AUDIO_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  const have = Object.keys(manifest.lines).length
  console.log(`manifest.json: ${have} clips (${collectLines(season, 'nb').length} nb lines in the game)`)
  const missing = collectLines(season, 'nb').filter(l => !manifest.lines[l.id])
  if (missing.length) console.log(`Missing (${missing.length}): ` + missing.slice(0, 8).map(l => `${l.id} «${l.text.slice(0, 30)}…»`).join('; ') + (missing.length > 8 ? ' …' : ''))
  if (stale.length) console.log(`Not used (the text has changed or the file is misnamed): ${stale.join(', ')}`)
} else {
  console.error('Usage: tryllegarden-audio.mjs list|build [--lang=nb|en] [--season=jul]')
  process.exit(1)
}
