import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { transform } from 'esbuild'
import { JSDOM } from 'jsdom'

const root = new URL('../', import.meta.url)
const source = readFileSync(new URL('src/pages/det-trettende-kabinett.astro', root), 'utf8')
const art = JSON.parse(readFileSync(new URL('src/lib/kabinett-art.json', root), 'utf8'))
const script = (await transform(source.split('<script>')[1].split('</script>')[0], { loader: 'ts' })).code
const tick = () => new Promise(resolve => setTimeout(resolve, 15))

async function fixture(stage, lang = 'nb') {
  const html = source.slice(source.indexOf('<main class="container game-main" id="game-root">'), source.indexOf('</BaseLayout>'))
    .replace(/<script type="application\/json"[^>]+\/>/, '<script type="application/json" id="kabinett-data"></script>')
  const dom = new JSDOM(html, { url: 'https://example.test/det-trettende-kabinett', runScripts: 'outside-only' })
  const { window } = dom
  window.matchMedia = () => ({ matches: true })
  window.scrollTo = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
  const requests = []
  window.fetch = async (_url, options) => {
    const request = JSON.parse(options.body); requests.push(request)
    let result = { lines: {} }
    if (request.action === 'hint') result = { text: 'Fixture hint', total: 3 }
    if (request.action === 'check') result = request.value === 'menneske' || request.room === 'daggry'
      ? { ok: true, solved: { html: 'Fixture explanation', facts: [], imageUrl: 'https://example.test/reveal.webp', imageAlt: 'Reveal' } }
      : { ok: false, msg: 'Try again' }
    return { ok: true, json: async () => result }
  }
  window.localStorage.setItem('kabinett-v1', JSON.stringify({ v: 1, stage, stageName: 'Tester', cards: [], gilded: [], path: {} }))
  window.localStorage.setItem('kabinett-lang', lang)
  const rooms = Object.fromEntries(Object.entries(art.rooms).map(([key, value]) => [key, { ...value, nb: { title: '', introHtml: '' }, en: { title: '', introHtml: '' } }]))
  rooms.salongen.curiosityUrl = '/images/cog.webp'
  window.document.getElementById('kabinett-data').textContent = JSON.stringify({ rooms, directors: art.directors, englishEnabled: true })
  window.eval(script)
  await tick()
  return { dom, window, requests }
}

test('room art loads only on entry; Salongen keeps its curiosity reward and uses API-driven poses', async () => {
  const { dom, window, requests } = await fixture('salongen')
  const d = window.document
  const pose = () => d.querySelector('#sc-salongen .director-portrait img').getAttribute('src')
  assert.match(d.querySelector('#sc-salongen .scene-image img').src, /salongen-1280/)
  assert.equal(d.querySelector('#sc-kinoen .scene-image img').hasAttribute('src'), false)
  assert.match(pose(), /director-point/)
  assert.ok(d.querySelector('#sl-cog img'))
  d.getElementById('sl-hint-btn').click(); await tick()
  assert.match(pose(), /director-hint/)
  assert.match(d.getElementById('sl-hints').textContent, /Fixture hint/)
  d.querySelector('[data-sl="urverk"]').click(); await tick()
  assert.match(pose(), /director-think/)
  assert.equal(d.querySelector('.solution-image'), null)
  d.querySelector('[data-sl="menneske"]').click(); await tick()
  assert.match(pose(), /director-solved/)
  assert.equal(d.getElementById('sl-solved').hidden, false)
  assert.equal(d.querySelector('#sl-solution img').alt, 'Reveal')
  d.getElementById('sl-cog').click()
  assert.ok(JSON.parse(window.localStorage.getItem('kabinett-v1')).cards.includes('5-klover'))
  assert.ok(requests.some(r => r.action === 'hint' && r.room === 'salongen'))
  dom.window.close()
})

test('English fallback preserves static headings and illusion rooms have no Director portrait', async () => {
  const { dom, window } = await fixture('trekanten', 'en')
  assert.ok(window.document.querySelector('#sc-trekanten .scene-heading').textContent.trim())
  assert.equal(window.document.querySelector('#sc-trekanten .director-portrait'), null)
  assert.ok(window.document.querySelector('#sc-trekanten svg'))
  dom.window.close()
})

test('the dawn API response does not replace the farewell pose', async () => {
  const { dom, window } = await fixture('daggry')
  assert.match(window.document.querySelector('#sc-daggry .director-portrait img').src, /director-farewell/)
  dom.window.close()
})
