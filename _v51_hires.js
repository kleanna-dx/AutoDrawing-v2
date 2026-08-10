const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Add tolerance
  await p.evaluate(() => {
    const doc = Editor.getDocument();
    const dims = doc.elements.filter(e => e.type === 'dimension');
    dims[0].tolerance = true;
    dims[0].toleranceUpper = '0.05';
    dims[0].toleranceLower = '0.02';
    const diamDim = dims.find(d => String(d.value).includes('⌀'));
    if (diamDim) {
      diamDim.tolerance = true;
      diamDim.toleranceUpper = '0.01';
      diamDim.toleranceLower = '0.01';
    }
    Renderer.render(doc);
  });
  await p.waitForTimeout(500);
  
  // Zoom way in on the 50 dimension area
  const svg = await p.$('#drawingSvg');
  const svgBox = await svg.boundingBox();
  // Zoom to the 50 dim text (around x=342, y=284 in SVG coords, which is upper-left area)
  await p.mouse.move(svgBox.x + 250, svgBox.y + 280);
  for (let i = 0; i < 18; i++) {
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'v51_tol_hires.png' });
  
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
