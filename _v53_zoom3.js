const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.click('#btnDemoMech');
  await page.waitForTimeout(3000);
  
  // Very tight zoom on left tap+drill area
  // From data: left tap x=292.5..352.5, drill x=292.5..356.5, triangle tip 358.5
  // y range: ~331..371 (with keyway above at 331)
  // Focus on just the tap/drill hidden lines
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    // zoom to left tap area: x=288..365, y=336..366
    svg.setAttribute('viewBox', '288 336 80 34');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_left_tap_detail.png' });
  
  // Right tap detail
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    // Right tap: x=660..732, y=336..366
    svg.setAttribute('viewBox', '658 336 80 34');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_right_tap_detail.png' });
  
  await browser.close();
  console.log('Done.');
})();
