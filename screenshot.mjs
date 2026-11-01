// Full-page screenshot: node screenshot.mjs <url> [label]
// Saves to "temporary screenshots/screenshot-N[-label].png", never overwriting.
import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const [url = 'http://localhost:3000', label] = process.argv.slice(2);
const dir = 'temporary screenshots';

await mkdir(dir, { recursive: true });
const taken = (await readdir(dir))
  .map((name) => name.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const n = taken.length ? Math.max(...taken) + 1 : 1;
const out = join(dir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // Let web fonts and entrance animations settle
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: out, fullPage: true });
  console.log(out);
} finally {
  await browser.close();
}
