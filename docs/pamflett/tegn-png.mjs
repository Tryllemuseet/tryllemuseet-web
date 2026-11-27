// Renders the booklet puzzle SVGs in docs/pamflett/hefter to print PNGs
// (run from the repo root: node docs/pamflett/tegn-png.mjs). Needs Playwright.
import { createRequire } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
const { chromium } = createRequire(import.meta.url)('playwright')
const dir = 'docs/pamflett/hefter'
const browser = await chromium.launch()
const page = await browser.newPage()
for (const f of readdirSync(dir).filter(f => f.endsWith('.svg'))) {
  const svg = readFileSync(`${dir}/${f}`, 'utf8')
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
  await page.setViewportSize({ width: +w, height: +h })
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`)
  await page.screenshot({ path: `${dir}/${f.replace('.svg', '.png')}`, clip: { x: 0, y: 0, width: +w, height: +h } })
}
await browser.close()
console.log('ok')
