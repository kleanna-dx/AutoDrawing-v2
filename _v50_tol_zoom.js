const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  await p.setViewportSize({width:2800, height:1800, deviceScaleFactor: 2});
  await p.goto('http://localhost:8080', {waitUntil:'domcontentloaded', timeout:10000});
  await p.waitForTimeout(2000);
  const bs = await p.$$('button');
  for (const btn of bs) {
    const t = await btn.textContent();
    if (t && t.includes('데모')) { await btn.click(); break; }
  }
  await p.waitForTimeout(4000);
  
  // Zoom into tolerance area at 2x - S1 50+/-0.01 area
  await p.screenshot({path: '/home/user/webapp/v50_tol_hi.png', clip: {x: 680, y: 530, width: 200, height: 100}});
  // Key tolerance 5+/-0.02
  await p.screenshot({path: '/home/user/webapp/v50_key_hi.png', clip: {x: 1250, y: 540, width: 200, height: 100}});
  console.log('OK');
  await b.close();
})();
