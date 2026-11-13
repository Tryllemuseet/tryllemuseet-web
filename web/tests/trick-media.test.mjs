import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transform } from 'esbuild'

const source = readFileSync(new URL('../src/lib/trickMedia.ts', import.meta.url), 'utf8')
const { code } = await transform(source, { loader: 'ts', format: 'cjs' })
const mod = { exports: {} }
new Function('module', 'exports', code)(mod, mod.exports)
const { videoEmbedUrl, videoPayload, withNorwegianCaptions } = mod.exports

test('YouTube and Vimeo links become players, other links do not', () => {
  assert.equal(videoEmbedUrl('https://youtu.be/abcdefghijk'), 'https://www.youtube-nocookie.com/embed/abcdefghijk')
  assert.equal(videoEmbedUrl('https://vimeo.com/123456/abcdef0123'), 'https://player.vimeo.com/video/123456?h=abcdef0123')
  assert.equal(videoEmbedUrl('https://example.test/film.mp4'), null)
})

test('the game card gets the effect video first, YouTube limited to the same channel', () => {
  const out = videoPayload([
    { label: 'Forklaring', url: 'https://vimeo.com/123456' },
    { label: 'Effekt', url: 'https://www.youtube.com/watch?v=abcdefghijk' },
  ])
  assert.deepEqual(out.map(v => v.label), ['Effekt', 'Forklaring'])
  assert.equal(out[0].embed, 'https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0&cc_load_policy=1&cc_lang_pref=no&hl=no')
  assert.equal(out[1].embed, 'https://player.vimeo.com/video/123456?texttrack=no')
})

test('players are asked for Norwegian subtitles', () => {
  assert.equal(withNorwegianCaptions('https://www.youtube-nocookie.com/embed/abcdefghijk'), 'https://www.youtube-nocookie.com/embed/abcdefghijk?cc_load_policy=1&cc_lang_pref=no&hl=no')
  assert.equal(withNorwegianCaptions('https://player.vimeo.com/video/123456?h=abcdef0123'), 'https://player.vimeo.com/video/123456?h=abcdef0123&texttrack=no')
  assert.equal(withNorwegianCaptions('https://example.test/film'), 'https://example.test/film')
})

test('unembeddable https links stay links, anything else is dropped', () => {
  const out = videoPayload([
    { label: 'Film', url: 'https://example.test/film.mp4' },
    { label: 'Farlig', url: 'javascript:alert(1)' },
    { label: 'Uten', url: '' },
    { label: 'Http', url: 'http://example.test/x' },
  ])
  assert.deepEqual(out, [{ label: 'Film', url: 'https://example.test/film.mp4' }])
  assert.deepEqual(videoPayload(null), [])
})
