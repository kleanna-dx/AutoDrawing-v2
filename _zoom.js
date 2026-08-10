const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("데모")');
  if (btn) await btn.click();
  await page.waitForTimeout(3000);
  
  // Zoom into gear + auxiliary area
  await page.screenshot({ path: 'zoom_aux.png', clip: { x: 150, y: 350, width: 250, height: 200 } });
  // Zoom into front view gear area
  await page.screenshot({ path: 'zoom_front.png', clip: { x: 280, y: 340, width: 150, height: 180 } });
  // Zoom into boss junction
  await page.screenshot({ path: 'zoom_boss.png', clip: { x: 350, y: 340, width: 150, height: 180 } });
  
  await browser.close();
  console.log('DONE');
})();
