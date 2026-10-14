import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { transform } from 'esbuild'

const root = new URL('../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const art = JSON.parse(read('src/lib/kabinett-art.json'))

test('all illustrated scenes exist, every asset resolves, and bilingual descriptions are present', () => {
  const page = read('src/pages/det-trettende-kabinett.astro')
  const scenes = [...page.matchAll(/id="sc-([a-z0-9]+)"/g)].map(m => m[1])
  assert.equal(scenes.length, 28)
  assert.equal(Object.keys(art.rooms).length, 27)
  assert.deepEqual(scenes.filter(key => !art.rooms[key]), ['daggry'])
  for (const [key, room] of Object.entries(art.rooms)) {
    assert.ok(scenes.includes(key))
    assert.ok(room.imageAlt && room.imageAltEn)
    for (const path of [room.imageUrl, ...room.imageSrcSet.split(', ').map(part => part.split(' ')[0])]) {
      assert.ok(existsSync(new URL(`public${path}`, root)), path)
    }
  }
  assert.equal(Object.keys(art.directors).length, 10)
  for (const path of Object.values(art.directors)) assert.ok(existsSync(new URL(`public${path}`, root)))
})

test('solution images and answers are excluded from the initial room query', () => {
  const source = read('src/lib/sanity.ts')
  const publicQuery = source.split('export async function getAllGameChapters')[1].split('export async function getGameRoomSecrets')[0]
  assert.doesNotMatch(publicQuery, /solutionImage|\banswer\b|hints\[|facts\[/)
  assert.match(publicQuery, /curiosityImage/)
})

test('the API withholds the solution image on start, hint and wrong answer and returns it on a correct answer', async () => {
  // Execute the production checker, replacing only its external Sanity dependencies.
  const source = read('src/lib/kabinett.ts')
    .replace(/import\s[\s\S]*?from\s+'[^']+'\n/g, '')
  const compiled = await transform(source, { loader: 'ts', format: 'cjs' })
  const room = {
    key: 'salongen', answer: 'correct-choice',
    hints: [{ text: 'A hint' }], responses: [], solution: [], facts: [],
    solutionImage: { asset: { _ref: 'private-image' }, alt: 'Avsløringen', altEn: 'The reveal' },
  }
  const exports = {}
  const module = { exports }
  const builder = { width() { return this }, format() { return this }, url() { return 'https://example.test/private-reveal.webp' } }
  new Function('module', 'exports', 'getPrivateClient', 'getGameConfig', 'getGameRoomSecrets', 'portableTextToHtml', 'privateUrlFor', compiled.code)(
    module, exports, () => ({ client: {} }), async () => ({ isActive: true }), async () => [room], () => 'Explanation', () => builder,
  )
  const answer = module.exports.answer
  for (const request of [
    { action: 'start' }, { action: 'hint', n: 0 }, { action: 'check', value: 'wrong-choice' },
  ]) {
    const result = await answer({ room: 'salongen', ...request })
    assert.equal(result.status, 200)
    assert.doesNotMatch(JSON.stringify(result.body), /private-reveal|Explanation/)
  }
  const result = await answer({ room: 'salongen', action: 'check', value: 'correct-choice', lang: 'en' })
  assert.equal(result.body.ok, true)
  assert.equal(result.body.solved.imageAlt, 'The reveal')
  assert.equal(result.body.solved.imageUrl, 'https://example.test/private-reveal.webp')
})
