const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  await p.setViewportSize({width:1400, height:900});
  await p.goto('http://localhost:8080', {waitUntil:'domcontentloaded', timeout:10000});
  await p.waitForTimeout(2000);
  const bs = await p.$$('button');
  for (const btn of bs) {
    const t = await btn.textContent();
    if (t && t.includes('데모')) { await btn.click(); break; }
  }
  await p.waitForTimeout(4000);
  
  // The tolerance dimensions are on key slots - look at full page 
  // Drawing visible at ~170-970 x, 170-710 y
  // Top dimensions with tolerance: around y=280-310, x=350-450 for S1 50 dim
  // Key dimension with tolerance: around y=280-310, x=590-680 for 5 dim
  // Full S1 area with key slot
  await p.screenshot({path: '/home/user/webapp/v50_s1.png', clip: {x: 340, y: 265, width: 200, height: 60}});
  await p.screenshot({path: '/home/user/webapp/v50_s3.png', clip: {x: 580, y: 265, width: 200, height: 60}});
  // Boss + shaft area with diameter dimension
  await p.screenshot({path: '/home/user/webapp/v50_diam.png', clip: {x: 290, y: 330, width: 200, height: 180}});
  console.log('OK');
  await b.close();
})();
