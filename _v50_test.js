const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  await p.setViewportSize({width:1400, height:900});
  await p.goto('http://localhost:8080', {waitUntil:'domcontentloaded', timeout:10000});
  await p.waitForTimeout(2000);
  
  // List all buttons
  const btnTexts = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent.trim().substring(0, 50),
      id: b.id,
      visible: b.offsetParent !== null
    }));
  });
  console.log('Buttons:', JSON.stringify(btnTexts, null, 2));
  
  // Try to find demo button by id
  const demoBtn = await p.$('#btnDemo');
  if (demoBtn) {
    console.log('Found #btnDemo, clicking...');
    await demoBtn.click();
    await p.waitForTimeout(3000);
  } else {
    // Try text match
    const allBtns = await p.$$('button');
    for (const btn of allBtns) {
      const t = await btn.textContent();
      if (t && (t.includes('데모') || t.toLowerCase().includes('demo') || t.includes('시연'))) {
        console.log('Found button:', t.trim());
        await btn.click();
        await p.waitForTimeout(3000);
        break;
      }
    }
  }
  
  // Full page
  await p.screenshot({path: '/home/user/webapp/v50_full.png'});
  
  const svgBox = await p.evaluate(() => {
    const s = document.querySelector('#drawingCanvas svg') || document.querySelector('svg');
    if (!s) return null;
    const r = s.getBoundingClientRect();
    return {x: r.x, y: r.y, w: r.width, h: r.height};
  });
  console.log('SVG:', JSON.stringify(svgBox));
  
  if (svgBox && svgBox.w > 0) {
    await p.screenshot({path: '/home/user/webapp/v50_dim.png', clip: {x: svgBox.x + 300, y: svgBox.y + 20, width: 280, height: 130}});
    await p.screenshot({path: '/home/user/webapp/v50_boss.png', clip: {x: svgBox.x + 180, y: svgBox.y + 270, width: 200, height: 150}});
    console.log('Dim screenshots saved');
  }
  
  await b.close();
  console.log('DONE');
})();
