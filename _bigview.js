const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:8080?v=46');
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("데모")');
  if (btn) await btn.click();
  await page.waitForTimeout(3000);
  
  // Gear auxiliary view (zoomed 2x)
  await page.screenshot({ path: 'v46_aux_big.png', clip: { x: 130, y: 360, width: 200, height: 200 } });
  // Gear front view (zoomed 2x)
  await page.screenshot({ path: 'v46_front_big.png', clip: { x: 260, y: 330, width: 200, height: 200 } });
  // Full gear + boss area
  await page.screenshot({ path: 'v46_gear_boss.png', clip: { x: 130, y: 310, width: 350, height: 250 } });
  
  await browser.close();
  console.log('DONE');
})();
