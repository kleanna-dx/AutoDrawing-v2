const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Programmatically add tolerance to a dimension
  await p.evaluate(() => {
    // Find all dimension elements and add tolerance to first horizontal one
    const doc = window._document || null;
    if (!doc) return 'NO_DOC';
    const dims = doc.elements.filter(e => e.type === 'dimension');
    // Add tolerance to the first dimension (50mm)
    if (dims.length > 0) {
      dims[0].tolerance = true;
      dims[0].toleranceUpper = '0.05';
      dims[0].toleranceLower = '0.02';
    }
    // Also add tolerance to a diameter dimension
    const diamDim = dims.find(d => String(d.value).includes('⌀'));
    if (diamDim) {
      diamDim.tolerance = true;
      diamDim.toleranceUpper = '0.01';
      diamDim.toleranceLower = '0.01';
    }
    // Re-render
    if (window.Renderer) Renderer.render(doc);
    return { dimCount: dims.length, tolAdded: true };
  });
  await p.waitForTimeout(500);
  
  // Take a zoomed screenshot of the tolerance area
  // First zoom in on the drawing
  const svg = await p.$('#drawingSvg');
  const svgBox = await svg.boundingBox();
  
  // Center mouse on SVG and zoom in
  await p.mouse.move(svgBox.x + svgBox.width / 2, svgBox.y + svgBox.height / 2);
  for (let i = 0; i < 8; i++) {
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(500);
  
  await p.screenshot({ path: 'v51_tol_zoom.png' });
  
  // Get tolerance text details after rendering
  const tolTexts = await p.$$eval('text', els => 
    els.filter(e => {
      const fs = parseFloat(e.getAttribute('font-size') || '0');
      return fs < 5 && fs > 0; // small text = tolerance
    }).map(e => ({
      text: e.textContent,
      x: e.getAttribute('x'),
      y: e.getAttribute('y'),
      fontSize: e.getAttribute('font-size')
    }))
  );
  console.log('TOL_TEXTS:', JSON.stringify(tolTexts, null, 2));
  
  // Get main dim text for comparison
  const mainDimTexts = await p.$$eval('.dimension-group text', els => 
    els.filter(e => {
      const fs = parseFloat(e.getAttribute('font-size') || '0');
      return fs >= 5;
    }).map(e => ({
      text: e.textContent,
      x: e.getAttribute('x'),
      y: e.getAttribute('y'),
      fontSize: e.getAttribute('font-size')
    }))
  );
  console.log('MAIN_DIM_TEXTS:', JSON.stringify(mainDimTexts.slice(0, 3), null, 2));
  
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
