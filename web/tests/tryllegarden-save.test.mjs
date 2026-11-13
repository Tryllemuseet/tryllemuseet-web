import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transform } from 'esbuild'

const source = readFileSync(new URL('../src/lib/tryllegardenSave.ts', import.meta.url), 'utf8')
const { code } = await transform(source, { loader: 'ts', format: 'cjs' })
const mod = { exports: {} }
new Function('module', 'exports', code)(mod, mod.exports)
const { encodeProgress, decodeProgress, mergeProgress } = mod.exports

const places = [
  { key: 'tunet', slot: 0 }, { key: 'fjoset', slot: 1 }, { key: 'laven', slot: 2 },
  { key: 'stallen', slot: 3 }, { key: 'lyktestien', slot: 7 }, { key: 'skogen', slot: 15 },
  { key: 'utenSlot' },
]
const progress = {
  done: { tunet: { smor: true }, laven: { smor: false }, skogen: { smor: true }, utenSlot: { smor: true } },
  hats: ['fjoset', 'laven', 'utenSlot'],
  finale: false,
}
const prefs = { level: 'laerling', read: true }

test('a code has the season, three groups of five, and survives a round trip', () => {
  const c = encodeProgress('jul', places, progress, prefs)
  assert.match(c, /^JUL-[0-9A-Z]{5}-[0-9A-Z]{5}-[0-9A-Z]{5}$/)
  const r = decodeProgress(c, 'jul', places)
  assert.equal(r.ok, true)
  assert.deepEqual(r.done, { tunet: { smor: true }, laven: { smor: false }, skogen: { smor: true } })
  assert.deepEqual(r.hats, ['fjoset', 'laven'])
  assert.equal(r.finale, false)
  assert.equal(r.level, 'laerling')
  assert.equal(r.read, true)
})

test('unset preferences and a finished finale are kept', () => {
  const c = encodeProgress('jul', places, { done: {}, hats: [], finale: true }, { level: null, read: null })
  const r = decodeProgress(c, 'jul', places)
  assert.equal(r.ok, true)
  assert.equal(r.finale, true)
  assert.equal(r.level, null)
  assert.equal(r.read, null)
  assert.equal(decodeProgress(encodeProgress('jul', places, progress, { level: 'mester', read: false }), 'jul', places).read, false)
})

test('the code does not depend on the order or visibility of places', () => {
  const c = encodeProgress('jul', places, progress, prefs)
  const shuffled = [...places].reverse().filter(p => p.key !== 'lyktestien')
  const r = decodeProgress(c, 'jul', shuffled)
  assert.equal(r.ok, true)
  assert.deepEqual(Object.keys(r.done).sort(), ['laven', 'skogen', 'tunet'])
})

test('case, spaces, hyphens and look-alike characters are forgiven', () => {
  const c = encodeProgress('jul', places, progress, prefs)
  const messy = c.toLowerCase().replace(/-/g, '  ')
  assert.equal(decodeProgress(messy, 'jul', places).ok, true)
  // 0 typed as O, 1 as I or L, V as U: only matters where the code has those characters
  const found = Array.from({ length: 60 }, (_, i) => encodeProgress('jul', places, { ...progress, hats: [], done: { tunet: { smor: i % 2 === 0 } }, finale: i % 3 === 0 }, { level: 'mester', read: i % 5 === 0 }))
    .find(code => /[01V]/.test(code.slice(4)))
  const swapped = found.slice(0, 4) + found.slice(4).replace(/0/g, 'O').replace(/1/g, 'I').replace(/V/g, 'U')
  assert.equal(decodeProgress(swapped, 'jul', places).ok, true)
})

test('a typing mistake or a wrong season is rejected', () => {
  const c = encodeProgress('jul', places, progress, prefs)
  let rejected = 0
  for (let i = 4; i < c.length; i++) {
    if (c[i] === '-') continue
    const other = c[i] === '2' ? '3' : '2'
    const r = decodeProgress(c.slice(0, i) + other + c.slice(i + 1), 'jul', places)
    if (!r.ok) rejected++
  }
  assert.equal(rejected, 15, 'every single-character mistake is caught')
  assert.equal(decodeProgress(c, 'paske', places).reason, 'season')
  assert.equal(decodeProgress('hei', 'jul', places).reason, 'format')
  assert.equal(decodeProgress('', 'jul', places).reason, 'format')
  assert.equal(decodeProgress(null, 'jul', places).reason, 'format')
  assert.equal(decodeProgress('JUL-!!!!!-?????-#####', 'jul', places).reason, 'format')
})

test('season keys with hyphens and letters that look like digits work', () => {
  const c = encodeProgress('jul-2027', places, progress, prefs)
  assert.equal(decodeProgress(c, 'jul-2027', places).ok, true)
  const s = encodeProgress('sommer', places, progress, prefs)
  assert.match(s, /^SOMMER-/)
  assert.equal(decodeProgress(s, 'sommer', places).ok, true)
})

test('merging only adds progress', () => {
  const merged = mergeProgress(
    { done: { tunet: { smor: false }, stua: { smor: true } }, hats: ['tunet'], finale: false },
    { done: { tunet: { smor: true }, fjoset: { smor: false } }, hats: ['fjoset'], finale: true },
  )
  assert.deepEqual(merged.done, { tunet: { smor: true }, stua: { smor: true }, fjoset: { smor: false } })
  assert.deepEqual([...merged.hats].sort(), ['fjoset', 'tunet'])
  assert.equal(merged.finale, true)
})
