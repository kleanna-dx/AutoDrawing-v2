const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("데모")');
  if (btn) await btn.click();
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    if (!svg) return { lines: [] };
    const allLines = svg.querySelectorAll('line');
    const lines = [];
    allLines.forEach(l => {
      const stroke = l.getAttribute('stroke');
      if (stroke === 'transparent' || stroke === '#6b7280') return;
      const x1 = parseFloat(l.getAttribute('x1'));
      const y1 = parseFloat(l.getAttribute('y1'));
      const x2 = parseFloat(l.getAttribute('x2'));
      const y2 = parseFloat(l.getAttribute('y2'));
      if (x1 >= 230 && x1 <= 260 && x2 >= 230 && x2 <= 260 && y1 >= 315 && y2 <= 390) {
        const isVert = Math.abs(x1 - x2) < 0.5;
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        if (isVert) lines.push({ x: x1.toFixed(1), y1: y1.toFixed(1), y2: y2.toFixed(1), len: len.toFixed(2), stroke });
      }
    });
    return { lines };
  });

  console.log('=== GEAR BODY VERTICAL LINES ===');
  data.lines.forEach(l => console.log(`x=${l.x}, y1=${l.y1} -> y2=${l.y2}, len=${l.len}, stroke=${l.stroke}`));

  await page.screenshot({ path: 'v48_gear.png', clip: { x: 260, y: 330, width: 180, height: 200 } });
  await page.screenshot({ path: 'v48_wide.png', clip: { x: 130, y: 310, width: 350, height: 250 } });
  await browser.close();
  console.log('DONE');
})();
