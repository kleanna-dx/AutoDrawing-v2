const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.click('#btnDemoMech');
  await page.waitForTimeout(3000);
  
  // Get exact bounds of ALL hidden lines (green) from the SVG
  const bounds = await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    const lines = svg.querySelectorAll('line[stroke="#4ade80"]');
    if (lines.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    lines.forEach(l => {
      [+l.getAttribute('x1'), +l.getAttribute('x2')].forEach(x => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
      [+l.getAttribute('y1'), +l.getAttribute('y2')].forEach(y => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    });
    return { minX, minY, maxX, maxY };
  });
  
  console.log('All hidden lines bounds:', JSON.stringify(bounds));
  
  // Left tap area zoom (first group of hidden lines, x < center)
  if (bounds) {
    const centerX = (bounds.minX + bounds.maxX) / 2;
    
    // Left tap + keyway area
    await page.evaluate((cx) => {
      const svg = document.querySelector('#drawingSvg');
      const lines = svg.querySelectorAll('line[stroke="#4ade80"]');
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      lines.forEach(l => {
        const x1 = +l.getAttribute('x1'), x2 = +l.getAttribute('x2');
        if (x1 < cx && x2 < cx) {
          [x1, x2].forEach(x => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
          [+l.getAttribute('y1'), +l.getAttribute('y2')].forEach(y => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
        }
      });
      const pad = 8;
      svg.setAttribute('viewBox', `${minX-pad} ${minY-pad} ${maxX-minX+2*pad} ${maxY-minY+2*pad}`);
    }, centerX);
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'v53_left_detail.png' });
    
    // Right tap + keyway area
    await page.evaluate((cx) => {
      const svg = document.querySelector('#drawingSvg');
      const lines = svg.querySelectorAll('line[stroke="#4ade80"]');
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      lines.forEach(l => {
        const x1 = +l.getAttribute('x1'), x2 = +l.getAttribute('x2');
        if (x1 > cx || x2 > cx) {
          [x1, x2].forEach(x => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
          [+l.getAttribute('y1'), +l.getAttribute('y2')].forEach(y => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
        }
      });
      const pad = 8;
      svg.setAttribute('viewBox', `${minX-pad} ${minY-pad} ${maxX-minX+2*pad} ${maxY-minY+2*pad}`);
    }, centerX);
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'v53_right_detail.png' });
    
    // Full shaft overview showing both taps
    await page.evaluate((b) => {
      const svg = document.querySelector('#drawingSvg');
      const pad = 30;
      svg.setAttribute('viewBox', `${b.minX-pad} ${b.minY-pad} ${b.maxX-b.minX+2*pad} ${b.maxY-b.minY+2*pad}`);
    }, bounds);
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'v53_both_taps.png' });
  }
  
  await browser.close();
  console.log('Done.');
})();
