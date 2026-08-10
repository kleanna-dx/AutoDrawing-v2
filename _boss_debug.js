const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  await page.setViewportSize({width:1400, height:900});
  await page.goto('http://localhost:8080', {waitUntil:'domcontentloaded', timeout:10000});
  await page.waitForTimeout(1500);
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await b.textContent();
    if (text && (text.includes('Demo') || text.includes('데모'))) { await b.click(); break; }
  }
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const svg = document.querySelector('#drawingCanvas svg') || document.querySelector('svg');
    if (!svg) return {error: 'no svg'};
    const lines = svg.querySelectorAll('line');
    const verts = [];
    lines.forEach(l => {
      const x1 = parseFloat(l.getAttribute('x1'));
      const y1 = parseFloat(l.getAttribute('y1'));
      const x2 = parseFloat(l.getAttribute('x2'));
      const y2 = parseFloat(l.getAttribute('y2'));
      const stroke = l.getAttribute('stroke') || 'none';
      if (x1 >= 250 && x1 <= 300 && Math.abs(x1 - x2) < 1 && stroke === '#000000') {
        verts.push({x: x1.toFixed(1), y1: Math.min(y1,y2).toFixed(1), y2: Math.max(y1,y2).toFixed(1), len: Math.abs(y2-y1).toFixed(1)});
      }
    });
    return {verts};
  });
  
  console.log('VERTICAL LINES (black, x: 250~300):');
  data.verts.sort((a,b) => parseFloat(a.x) - parseFloat(b.x) || parseFloat(a.y1) - parseFloat(b.y1));
  data.verts.forEach(l => console.log(`  x=${l.x} y=${l.y1}→${l.y2} len=${l.len}`));

  // Take screenshot
  const el = await page.$('#drawingCanvas svg') || await page.$('svg');
  if (el) {
    const box = await el.boundingBox();
    if (box) {
      // Boss area zoom
      await page.screenshot({path: 'v49_boss.png', clip: {x: box.x+210, y: box.y+280, width: 120, height: 140}});
      console.log('Screenshot: v49_boss.png');
    }
  }
  
  await browser.close();
  console.log('DONE');
})();
