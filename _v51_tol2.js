const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Programmatically add tolerance
  const result = await p.evaluate(() => {
    const doc = Editor.getDocument();
    if (!doc) return 'NO_DOC';
    const dims = doc.elements.filter(e => e.type === 'dimension');
    // Add tolerance to first horizontal dim (50mm)
    if (dims.length > 0) {
      dims[0].tolerance = true;
      dims[0].toleranceUpper = '0.05';
      dims[0].toleranceLower = '0.02';
    }
    // Add tolerance to a diameter dim (⌀20)
    const diamDim = dims.find(d => String(d.value).includes('⌀'));
    if (diamDim) {
      diamDim.tolerance = true;
      diamDim.toleranceUpper = '0.01';
      diamDim.toleranceLower = '0.01';
    }
    Renderer.render(doc);
    return { dimCount: dims.length, firstVal: dims[0]?.value, diamVal: diamDim?.value };
  });
  console.log('RESULT:', JSON.stringify(result));
  await p.waitForTimeout(500);
  
  // Check tolerance texts rendered
  const tolTexts = await p.$$eval('.dimension-group text', els => 
    els.map(e => ({
      text: e.textContent,
      x: e.getAttribute('x'),
      y: e.getAttribute('y'),
      fontSize: e.getAttribute('font-size')
    })).filter(e => e.text.startsWith('+') || e.text.startsWith('-'))
  );
  console.log('TOL_TEXTS:', JSON.stringify(tolTexts, null, 2));
  
  // Zoom into the area where 50mm dim is
  const svg = await p.$('#drawingSvg');
  const svgBox = await svg.boundingBox();
  await p.mouse.move(svgBox.x + 300, svgBox.y + 250);
  for (let i = 0; i < 10; i++) {
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(150);
  }
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'v51_tol_close.png' });
  
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
