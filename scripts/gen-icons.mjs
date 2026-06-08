// Rasterize PWA icons from the reticle mark using Playwright (no native SVG tools needed).
// Outputs to public/icons/. Run: node scripts/gen-icons.mjs
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const OUT = 'public/icons'
mkdirSync(OUT, { recursive: true })

// The reticle, centred in a 32x32 box. `border` draws the framed look (for "any"
// icons); maskable omits it and bleeds the background to the edges (OS adds mask).
const reticle = (border) => `
  ${border ? '<rect x="1" y="1" width="30" height="30" rx="2.5" fill="none" stroke="#c89a4e" stroke-width="1" opacity="0.55"/>' : ''}
  <g fill="none" stroke="#ddb874" stroke-width="2"><circle cx="16" cy="16" r="8"/></g>
  <g stroke="#c89a4e" stroke-width="2" stroke-linecap="square">
    <line x1="16" y1="3.5" x2="16" y2="7.5"/><line x1="16" y1="24.5" x2="16" y2="28.5"/>
    <line x1="3.5" y1="16" x2="7.5" y2="16"/><line x1="24.5" y1="16" x2="28.5" y2="16"/>
  </g>
  <circle cx="16" cy="16" r="2" fill="#f0d49c"/>`

// markScale = fraction of the canvas the 32-unit mark occupies (rest is padding).
function pageSVG(px, bg, markScale, border) {
  const mark = px * markScale
  const off = (px - mark) / 2
  return `<!doctype html><meta charset="utf-8">
  <style>html,body{margin:0}#c{width:${px}px;height:${px}px;background:${bg}}</style>
  <div id="c"><svg width="${px}" height="${px}" viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${off} ${off}) scale(${mark / 32})">${reticle(border)}</g>
  </svg></div>`
}

const STEEL_950 = '#0d0f13'
const STEEL_900 = '#161a20'

const jobs = [
  { file: 'icon-192.png', px: 192, bg: STEEL_950, scale: 0.86, border: true },
  { file: 'icon-512.png', px: 512, bg: STEEL_950, scale: 0.86, border: true },
  // maskable: full-bleed bg, mark in the ~60% safe zone, no frame
  { file: 'maskable-512.png', px: 512, bg: STEEL_900, scale: 0.6, border: false },
  // apple touch icon: opaque, slight padding, no frame (iOS rounds corners itself)
  { file: 'apple-touch-icon.png', px: 180, bg: STEEL_900, scale: 0.7, border: false },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const j of jobs) {
  await page.setViewportSize({ width: j.px, height: j.px })
  await page.setContent(pageSVG(j.px, j.bg, j.scale, j.border))
  await page.locator('#c').screenshot({ path: `${OUT}/${j.file}` })
  console.log(`  ${OUT}/${j.file} (${j.px}px)`)
}
await browser.close()
console.log('icons done')
