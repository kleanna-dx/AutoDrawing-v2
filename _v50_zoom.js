const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  await p.setViewportSize({width:1400, height:900});
  await p.goto('http://localhost:8080', {waitUntil:'domcontentloaded', timeout:10000});
  await p.waitForTimeout(2000);

  // First click "Shaft" card
  const bs = await p.$$('button');
  for (const btn of bs) {
    const t = await btn.textContent();
    if (t && t.includes('Shaft')) { await btn.click(); console.log('Clicked Shaft'); break; }
  }
  await p.waitForTimeout(1000);
  
  // Then click demo
  const bs2 = await p.$$('button');
  for (const btn of bs2) {
    const t = await btn.textContent();
    if (t && t.includes('데모')) { await btn.click(); console.log('Clicked Demo'); break; }
  }
  await p.waitForTimeout(4000);

  // Check for SVG
  const svgExists = await p.evaluate(() => {
    const s = document.querySelector('#drawingCanvas svg');
    return s ? {exists: true, children: s.childElementCount, rect: s.getBoundingClientRect()} : {exists: false};
  });
  console.log('SVG:', JSON.stringify(svgExists));
  
  if (svgExists.exists && svgExists.rect.width > 0) {
    const r = svgExists.rect;
    await p.screenshot({path: '/home/user/webapp/v50_tol.png', clip: {x: r.x + 300, y: r.y + 120, width: 380, height: 200}});
    await p.screenshot({path: '/home/user/webapp/v50_shaft.png', clip: {x: r.x + 200, y: r.y + 250, width: 550, height: 250}});
    console.log('Saved');
  } else {
    // Take full page screenshot to debug
    await p.screenshot({path: '/home/user/webapp/v50_debug.png'});
    console.log('Debug screenshot saved');
  }
  await b.close();
})();
