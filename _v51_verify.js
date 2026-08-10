const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  
  const errors = [];
  p.on('pageerror', err => errors.push(err.message));
  
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Test clicking dimensions at various positions
  const allDimTexts = await p.$$eval('.dimension-group text', els => 
    els.filter(e => parseFloat(e.getAttribute('font-size') || '0') >= 5)
        .map(e => {
          const r = e.getBoundingClientRect();
          return { text: e.textContent, cx: r.x + r.width/2, cy: r.y + r.height/2 };
        })
  );
  
  const results = [];
  for (const dt of allDimTexts) {
    // Click on empty area first
    await p.mouse.click(50, 50);
    await p.waitForTimeout(200);
    
    // Click on dim text
    await p.mouse.click(dt.cx, dt.cy);
    await p.waitForTimeout(300);
    
    const selPanel = await p.$eval('#panelSelection', el => el.style.display).catch(() => 'ERR');
    const dimVal = await p.$eval('#propDimValue', el => el.value).catch(() => 'ERR');
    results.push({ clicked: dt.text, selected: dimVal, panel: selPanel });
  }
  
  console.log('CLICK_RESULTS:');
  results.forEach(r => console.log(`  ${r.clicked} -> selected=${r.selected} panel=${r.panel}`));
  
  // Also test clicking on extension line area (between text and measurement points)
  // For dim "50" (x1=292.5 y1=331.25, offset=43, so dimLine y=288.25)
  // Extension line goes from y=331.25 to y=288.25 at x=292.5
  // Click somewhere on extension line area
  const extLineTest = await p.evaluate(() => {
    const doc = Editor.getDocument();
    const dim50 = doc.elements.find(e => e.type === 'dimension' && e.value === '50');
    if (!dim50) return null;
    // SVG coords of extension line area: around (x1, between y1 and dimLineY)
    return { x1: dim50.x1, y1: dim50.y1, offset: dim50.offset };
  });
  
  if (extLineTest) {
    const svgMidY = extLineTest.y1 - extLineTest.offset / 2; // middle of extension line
    console.log('EXT_LINE_SVG:', { x: extLineTest.x1, y: svgMidY });
    
    // Convert to screen coords using the SVG transform
    const screenPt = await p.evaluate((svgX, svgY) => {
      const svg = document.getElementById('drawingSvg');
      const layer = document.getElementById('drawingLayer');
      const transform = layer.getAttribute('transform');
      // Parse transform: translate(tx, ty) scale(s)
      const m = transform.match(/translate\(([\d.-]+),\s*([\d.-]+)\)\s*scale\(([\d.-]+)\)/);
      if (!m) return null;
      const tx = parseFloat(m[1]), ty = parseFloat(m[2]), s = parseFloat(m[3]);
      const rect = svg.getBoundingClientRect();
      return {
        screenX: rect.left + svgX * s + tx,
        screenY: rect.top + svgY * s + ty
      };
    }, extLineTest.x1, extLineTest.y1 - extLineTest.offset / 2);
    
    if (screenPt) {
      await p.mouse.click(50, 50);
      await p.waitForTimeout(200);
      await p.mouse.click(screenPt.screenX, screenPt.screenY);
      await p.waitForTimeout(300);
      const dimVal = await p.$eval('#propDimValue', el => el.value).catch(() => 'NONE');
      console.log('EXT_LINE_CLICK:', dimVal);
    }
  }
  
  console.log('JS_ERRORS:', errors.length);
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
