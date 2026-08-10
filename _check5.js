const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  const demoBtn = await page.$('button:has-text("데모")');
  if (demoBtn) await demoBtn.click();
  await page.waitForTimeout(4000);
  
  // Scroll down to make sure gear area is visible
  await page.evaluate(() => {
    const container = document.querySelector('#canvasContainer') || document.querySelector('.drawing-container');
    if (container) container.scrollTop = 300;
    // Also try window scroll
    window.scrollTo(0, 300);
  });
  await page.waitForTimeout(500);
  
  // Take full page screenshot 
  await page.screenshot({ path: '_fullpage.png', fullPage: true });
  
  // Get viewport screenshot
  await page.screenshot({ path: '_viewport.png' });
  
  console.log('DONE');
  await browser.close();
})();
