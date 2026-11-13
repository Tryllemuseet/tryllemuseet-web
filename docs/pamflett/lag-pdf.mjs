// Turns the two pamphlet HTML files into PDFs with Chromium.
// Called by bygg-pamflett.py; can also be run alone: node docs/pamflett/lag-pdf.mjs
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
let chromium
try { ({ chromium } = createRequire(import.meta.url)('playwright')) } catch { ({ chromium } = createRequire('/')('playwright')) }
const jobs = [['trykk', '321mm', '234mm'], ['lese', '148.5mm', '210mm']]
const browser = await chromium.launch()
for (const [mode, width, height] of jobs) {
  const page = await browser.newPage()
  await page.goto('file://' + join(here, `pamflett-${mode}.html`), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  const over = await page.$$eval('.content', els => els.map((e, i) => [i + 1, e.scrollHeight - e.clientHeight]).filter(x => x[1] > 0))
  if (over.length) console.log(mode, 'OVERFLOW (page, px):', JSON.stringify(over))
  await page.pdf({ path: join(here, `pamflett-${mode}.pdf`), width, height, printBackground: true, preferCSSPageSize: true })
  console.log('wrote', `pamflett-${mode}.pdf`)
}
await browser.close()
