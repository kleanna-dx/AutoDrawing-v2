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
  
  // Zoom into the S1 area where tolerance dimensions are 
  // From full screenshot: drawing area starts around x=170, y=170
  // S1 section with 50+0.01/-0.01 is around x=360, y=285
  // 5+0.02/-0.02 is around x=650, y=295
  await p.screenshot({path: '/home/user/webapp/v50_s1_tol.png', clip: {x: 345, y: 275, width: 130, height: 80}});
  await p.screenshot({path: '/home/user/webapp/v50_key_tol.png', clip: {x: 600, y: 280, width: 150, height: 80}});
  // Full drawing area
  await p.screenshot({path: '/home/user/webapp/v50_drawing.png', clip: {x: 170, y: 170, width: 800, height: 550}});
  console.log('OK');
  await b.close();
})();
