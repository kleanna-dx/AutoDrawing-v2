const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 }, deviceScaleFactor: 3 });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  const demoBtn = await page.$('button:has-text("데모")');
  if (demoBtn) await demoBtn.click();
  await page.waitForTimeout(4000);

  // The drawing canvas is at roughly (105, 275) in viewport, ~710x480 size
  // Aux view gear: around (210, 490) center, ~35px radius
  // Front view gear+boss: around (290-390, 480) area
  
  // Get the canvas container position
  const canvasPos = await page.evaluate(() => {
    const container = document.querySelector('#canvasContainer');
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
  });
  console.log('Canvas:', JSON.stringify(canvasPos));
  
  // Get precise element positions from SVG coordinate space
  const gearData = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const svgRect = svg.getBoundingClientRect();
    
    // SVG internal dimensions  
    const vb = svg.getAttribute('viewBox');
    const svgW = parseFloat(svg.getAttribute('width') || svg.clientWidth);
    const svgH = parseFloat(svg.getAttribute('height') || svg.clientHeight);
    
    // Get transformation from SVG coords to screen coords
    const pt = svg.createSVGPoint();
    function svgToScreen(x, y) {
      pt.x = x; pt.y = y;
      const ctm = svg.getScreenCTM();
      const transformed = pt.matrixTransform(ctm);
      return { x: transformed.x, y: transformed.y };
    }
    
    // Aux center at SVG coords (155.5, 351.25)
    const auxCenter = svgToScreen(155.5, 351.25);
    const auxEdge = svgToScreen(155.5 + 35, 351.25);
    const auxRadius = auxEdge.x - auxCenter.x;
    
    // Front view left edge at SVG (236.5, 320)
    const frontTL = svgToScreen(236.5, 318);
    const frontBR = svgToScreen(252.5, 384);
    
    // Boss area (252.5 to 293)
    const bossTL = svgToScreen(252.5, 320);
    const bossBR = svgToScreen(296, 384);
    
    return { 
      auxCenter, auxRadius, 
      frontTL, frontBR,
      bossTL, bossBR,
      svgRect: { x: svgRect.x, y: svgRect.y, w: svgRect.width, h: svgRect.height }
    };
  });
  
  console.log('Gear data:', JSON.stringify(gearData, null, 2));
  
  // Screenshot: Auxiliary view
  const ac = gearData.auxCenter;
  const ar = gearData.auxRadius;
  await page.screenshot({
    path: '_z_aux.png',
    clip: { x: ac.x - ar - 15, y: ac.y - ar - 15, width: (ar + 15) * 2, height: (ar + 15) * 2 }
  });
  
  // Screenshot: Front view trapezoids
  const ft = gearData.frontTL;
  const fb = gearData.frontBR;
  await page.screenshot({
    path: '_z_front.png',
    clip: { x: ft.x - 5, y: ft.y - 5, width: fb.x - ft.x + 10, height: fb.y - ft.y + 10 }
  });
  
  // Screenshot: Boss area
  const bt = gearData.bossTL;
  const bb = gearData.bossBR;
  await page.screenshot({
    path: '_z_boss.png',
    clip: { x: bt.x - 5, y: bt.y - 5, width: bb.x - bt.x + 10, height: bb.y - bt.y + 10 }
  });
  
  // Screenshot: Full gear + boss in one shot
  await page.screenshot({
    path: '_z_all.png',
    clip: { 
      x: ac.x - ar - 15, 
      y: Math.min(ac.y - ar, ft.y) - 15, 
      width: bb.x - (ac.x - ar - 15) + 15, 
      height: Math.max(ac.y + ar, fb.y) - Math.min(ac.y - ar, ft.y) + 30 
    }
  });
  
  console.log('DONE');
  await browser.close();
})();
