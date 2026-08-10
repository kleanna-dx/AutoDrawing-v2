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

  const el = await page.$('#drawingCanvas svg') || await page.$('svg');
  if (el) {
    const box = await el.boundingBox();
    if (box) {
      // Gear + boss area zoom (wider)
      await page.screenshot({path: 'v49_gear_boss_wide.png', clip: {x: box.x+100, y: box.y+250, width: 250, height: 180}});
      console.log('Screenshot saved: v49_gear_boss_wide.png');
    }
  }
  await browser.close();
  console.log('DONE');
})();
