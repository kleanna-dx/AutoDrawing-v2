const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.click('#btnDemoMech');
  await page.waitForTimeout(3000);
  
  // Check hidden line styles
  const styles = await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    const lines = svg.querySelectorAll('line[stroke="#4ade80"]');
    const results = [];
    lines.forEach(l => {
      results.push({
        dash: l.getAttribute('stroke-dasharray'),
        width: l.getAttribute('stroke-width'),
        x1: +l.getAttribute('x1'),
        y1: +l.getAttribute('y1')
      });
    });
    return results;
  });
  
  console.log('Hidden line count:', styles.length);
  if (styles.length > 0) {
    console.log('Dash pattern:', styles[0].dash);
    console.log('Stroke width:', styles[0].width);
  }
  
  // Zoom to shaft body
  await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    svg.setAttribute('viewBox', '250 325 500 60');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'v53_dash_reduced.png' });
  
  await browser.close();
  console.log('Done.');
})();
