const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.click('#btnDemoMech');
  await page.waitForTimeout(3000);
  
  // Zoom into left tap area — precise coordinates from test output
  // Left tap lines: x=292.5 to x=358.5, y=331.3 to 371.3  
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    // Left tap area: x=285 y=328, w=80 h=50
    svg.setAttribute('viewBox', '285 328 80 50');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_left_tap_close.png' });
  
  // Right tap area: x=660 y=328, w=80 h=50
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    svg.setAttribute('viewBox', '660 328 80 50');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_right_tap_close.png' });
  
  // Full view
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    svg.setAttribute('viewBox', '200 260 600 200');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_shaft_overview.png' });
  
  await browser.close();
  console.log('Screenshots saved.');
})();
