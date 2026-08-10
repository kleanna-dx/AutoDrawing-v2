const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:8080');
  await page.click('button:has-text("데모")');
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    const lines = svg.querySelectorAll('line');
    const result = [];
    lines.forEach(l => {
      const x1 = parseFloat(l.getAttribute('x1'));
      const y1 = parseFloat(l.getAttribute('y1'));
      const x2 = parseFloat(l.getAttribute('x2'));
      const y2 = parseFloat(l.getAttribute('y2'));
      const stroke = l.getAttribute('stroke') || '';
      // x=292-293 area, all strokes
      if (Math.abs(x1 - x2) < 0.5 && x1 >= 291 && x1 <= 294 && Math.min(y1,y2) >= 260) {
        result.push({
          x: x1.toFixed(1), y1: y1.toFixed(2), y2: y2.toFixed(2),
          len: Math.abs(y2 - y1).toFixed(2),
          stroke: stroke
        });
      }
    });
    return result;
  });

  data.forEach(l => {
    console.log(`x=${l.x} y1=${l.y1} y2=${l.y2} len=${l.len} stroke=${l.stroke}`);
  });

  await browser.close();
})();
