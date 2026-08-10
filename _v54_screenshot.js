const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // Click DB button
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    const dbBtn = Array.from(btns).find(b => b.textContent.includes('DB'));
    if (dbBtn) dbBtn.click();
  });
  
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: '/home/user/webapp/_db_modal.png', fullPage: false });
  console.log('Screenshot saved');
  
  // Get modal HTML for analysis
  const html = await page.evaluate(() => {
    const modal = document.querySelector('.modal, .dialog, .popup, [class*="modal"], [class*="dialog"], [class*="overlay"]');
    if (modal) return modal.innerHTML?.substring(0, 2000);
    return document.body.innerHTML.substring(0, 2000);
  });
  console.log('Modal HTML:', html?.substring(0, 1000));
  
  await browser.close();
})();
