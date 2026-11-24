// Renderiza cada SVG de diagramas/svg a PNG (2x) en diagramas/png.
// Uso: node diagramas/render.js [nombre.svg ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const svgDir = path.join(__dirname, 'svg');
  const outDir = path.join(__dirname, 'png');
  fs.mkdirSync(outDir, { recursive: true });
  const files = process.argv.slice(2).length
    ? process.argv.slice(2)
    : fs.readdirSync(svgDir).filter((f) => f.endsWith('.svg'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const f of files) {
    const svg = fs.readFileSync(path.join(svgDir, f), 'utf8');
    const w = Number(/width="(\d+)"/.exec(svg)[1]);
    const h = Number(/height="(\d+)"/.exec(svg)[1]);
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(
      `<html><body style="margin:0;background:transparent">${svg}</body></html>`
    );
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(outDir, f.replace(/\.svg$/, '.png'));
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    console.log('ok', out);
  }
  await browser.close();
})();
