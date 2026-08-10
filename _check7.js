const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  // Use 1x scale for easier coordinate math
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  const demoBtn = await page.$('button:has-text("데모")');
  if (demoBtn) await demoBtn.click();
  await page.waitForTimeout(4000);

  // SVG is at position (48, 56) with 1:1 scale (1032x1144)
  // Internal SVG coords map directly to pixel positions within the SVG element
  // So SVG point (155.5, 351.25) = screen (48+155.5, 56+351.25) = (203.5, 407.25)
  
  const svgX = 48, svgY = 56;
  
  // Auxiliary view: center at SVG (155.5, 351.25), outer radius ~31
  await page.screenshot({
    path: '_z2_aux.png',
    clip: { x: svgX + 155.5 - 45, y: svgY + 351.25 - 45, width: 90, height: 90 }
  });
  
  // Front view: gear body at x=236.5 to 252.5, y=318 to 384
  await page.screenshot({
    path: '_z2_front.png',
    clip: { x: svgX + 233, y: svgY + 315, width: 25, height: 72 }
  });
  
  // Boss area: x=252 to 296, y=320 to 384
  await page.screenshot({
    path: '_z2_boss.png',
    clip: { x: svgX + 250, y: svgY + 318, width: 50, height: 68 }
  });
  
  // Full gear+boss combo
  await page.screenshot({
    path: '_z2_combo.png',
    clip: { x: svgX + 108, y: svgY + 300, width: 195, height: 115 }
  });
  
  console.log('DONE');
  await browser.close();
})();
