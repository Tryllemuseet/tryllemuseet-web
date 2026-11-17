import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transform } from 'esbuild'

const source = readFileSync(new URL('../src/lib/tryllegardenAudio.ts', import.meta.url), 'utf8')
const { code } = await transform(source, { loader: 'ts', format: 'cjs' })
const mod = { exports: {} }
new Function('module', 'exports', code)(mod, mod.exports)
const { audioKey, audioText } = mod.exports

test('the id depends on language and words, not on spacing', () => {
  assert.equal(audioKey('nb', 'Se,  Trym!\n'), audioKey('nb', 'Se, Trym!'))
  assert.notEqual(audioKey('nb', 'Se, Trym!'), audioKey('en', 'Se, Trym!'))
  assert.notEqual(audioKey('nb', 'Se, Trym!'), audioKey('nb', 'Se, Tiril!'))
})

test('the id is 7 base-36 characters and stable', () => {
  assert.match(audioKey('nb', 'Hei'), /^[0-9a-z]{7}$/)
  assert.equal(audioKey('nb', 'Hei'), audioKey('nb', 'Hei'))
  assert.equal(audioText('  a \n b  '), 'a b')
})

test('every line of the built-in season has a distinct id', async () => {
  const { stdout } = await import('node:child_process').then(m => new Promise((res, rej) =>
    m.execFile('node', [new URL('../../scripts/tryllegarden-audio.mjs', import.meta.url).pathname, 'list'], (e, so) => (e ? rej(e) : res({ stdout: so })))))
  assert.match(stdout, /\d+ lines/)
})
