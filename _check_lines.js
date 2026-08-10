const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2800, height: 1800, deviceScaleFactor: 2 } });
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
      if (stroke === '#000000') {
        // Gear front view area: x=236-253, y=318-384
        if (x1 >= 233 && x1 <= 256 && x2 >= 233 && x2 <= 256 &&
            y1 >= 318 && y2 >= 318 && y1 <= 384 && y2 <= 384) {
          const isVert = Math.abs(x1 - x2) < 0.5;
          const isHoriz = Math.abs(y1 - y2) < 0.5;
          const isDiag = !isVert && !isHoriz;
          console.log(`GEAR_FRONT: (${x1.toFixed(1)},${y1.toFixed(2)}) → (${x2.toFixed(1)},${y2.toFixed(2)}) ${isVert?'VERT':isHoriz?'HORIZ':'DIAG'} len=${Math.sqrt((x2-x1)**2+(y2-y1)**2).toFixed(2)}`);
        }
      }
    });
    return result;
  });

  await browser.close();
})();
