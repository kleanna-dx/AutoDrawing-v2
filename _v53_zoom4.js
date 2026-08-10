const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.click('#btnDemoMech');
  await page.waitForTimeout(3000);
  
  // Zoom inside the shaft body where hidden lines should be visible
  // Left section S1: shaft outline from ~292.5 (left edge) to ~342.5 (right edge of S1)
  // Hidden lines: tap at x=292.5..352.5, drill at 292.5..356.5
  // oy = 351.25, shaft from oy-20=331.25 to oy+20=371.25
  // tap hidden lines: y=341.25 and y=361.25 (inside shaft)
  // drill lines: y=342.75 and y=359.75
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    // Focus on the internal area of left section
    svg.setAttribute('viewBox', '290 338 72 28');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_inside_left.png' });
  
  // Right section
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    svg.setAttribute('viewBox', '664 338 72 28');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_inside_right.png' });
  
  // Wide view showing the shaft body
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    svg.setAttribute('viewBox', '250 325 500 60');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_shaft_body.png' });
  
  await browser.close();
  console.log('Done.');
})();
