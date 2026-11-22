// Render a design HTML file to a PNG at an exact pixel size.
// usage: node render.cjs <design.html> <out.png> [width=1080] [height=1080]
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

const [, , input, output, w = '1080', h = '1080'] = process.argv;
if (!input || !output) {
  console.error('usage: node render.cjs <design.html> <out.png> [width] [height]');
  process.exit(1);
}
const width = Number(w), height = Number(h);
(async () => {
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const missing = await page.evaluate(() =>
  [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src));
if (missing.length) console.error('WARNING images failed to load:', missing.join(', '));
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll('[data-fit]')].filter(e => e.scrollHeight > e.clientHeight + 12 || e.scrollWidth > e.clientWidth + 4).map(e => e.dataset.fit));
if (overflow.length) console.error('WARNING text overflows its box:', overflow.join(', '));
await page.screenshot({ path: output, clip: { x: 0, y: 0, width, height } });
await browser.close();
console.log(`saved ${output} (${width}x${height})`);
})().catch(e => { console.error(e); process.exit(1); });
