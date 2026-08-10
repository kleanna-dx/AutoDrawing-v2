const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 3 });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  const demoBtn = await page.$('button:has-text("데모")');
  if (demoBtn) await demoBtn.click();
  await page.waitForTimeout(4000);

  // Bore circle screen center: (257, 611), screenWidth: 33
  // Auxiliary view center is the same (155.5, 351.25 in SVG coords → ~257, 611 on screen)
  // Gear outer radius in screen coords: 31 * 0.83 ≈ 25.7 px
  
  // Aux view closeup at 3x  
  await page.screenshot({
    path: '_z4_aux.png',
    clip: { x: 257 - 35, y: 611 - 35, width: 70, height: 70 }
  });
  
  // Front view: gear body is to the right of aux view
  // SVG x=236.5 → screen x = 80 + 236.5*0.83 = 80 + 196.3 = 276.3
  // SVG y=320 → screen y = 263.6 + 320*0.83 = 263.6 + 265.6 = 529.2
  // SVG y=384 → screen y = 263.6 + 384*0.83 = 263.6 + 318.7 = 582.3
  await page.screenshot({
    path: '_z4_front.png',
    clip: { x: 273, y: 525, width: 20, height: 62 }
  });
  
  // Boss area: SVG x=252.5→295, y=320→384
  // SVG x=252.5 → screen x = 80 + 252.5*0.83 = 289.6
  // SVG x=295 → screen x = 80 + 295*0.83 = 324.9
  await page.screenshot({
    path: '_z4_boss.png',
    clip: { x: 287, y: 525, width: 45, height: 62 }
  });
  
  // Full combo at 3x
  await page.screenshot({
    path: '_z4_combo.png',
    clip: { x: 215, y: 565, width: 125, height: 95 }
  });
  
  console.log('DONE');
  await browser.close();
})();
