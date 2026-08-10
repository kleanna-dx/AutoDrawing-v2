const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Add tolerance to test
  await p.evaluate(() => {
    const doc = Editor.getDocument();
    const dims = doc.elements.filter(e => e.type === 'dimension');
    // Horizontal 50mm
    dims[0].tolerance = true;
    dims[0].toleranceUpper = '0.05';
    dims[0].toleranceLower = '0.02';
    // Diameter ⌀20
    const diamDim = dims.find(d => String(d.value).includes('⌀'));
    if (diamDim) {
      diamDim.tolerance = true;
      diamDim.toleranceUpper = '0.01';
      diamDim.toleranceLower = '0.01';
    }
    Renderer.render(doc);
  });
  await p.waitForTimeout(500);
  
  // Verify tolerance text sizes
  const tolData = await p.$$eval('.dimension-group text', els => 
    els.map(e => ({
      text: e.textContent,
      fontSize: parseFloat(e.getAttribute('font-size') || '0')
    })).filter(e => e.text.startsWith('+') || e.text.startsWith('-'))
  );
  console.log('TOL_DATA:', JSON.stringify(tolData));
  // Expected: fontSize = 6 * 0.42 = 2.52
  
  // Zoom to 50 dim with tolerance
  const svg = await p.$('#drawingSvg');
  const svgBox = await svg.boundingBox();
  await p.mouse.move(svgBox.x + 250, svgBox.y + 280);
  for (let i = 0; i < 18; i++) {
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'v51_final_zoom.png' });
  
  // Test clicking the 50 dim text to select it
  // Get screen coords for "50" text
  const dimInfo = await p.evaluate(() => {
    const texts = document.querySelectorAll('.dimension-group text');
    for (const t of texts) {
      if (t.textContent === '50') {
        const r = t.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2 };
      }
    }
    return null;
  });
  
  if (dimInfo) {
    await p.mouse.click(dimInfo.x, dimInfo.y);
    await p.waitForTimeout(500);
    const val = await p.$eval('#propDimValue', el => el.value);
    console.log('CLICKED_50_SELECTED:', val);
    const tolChk = await p.$eval('#propTolerance', el => el.checked);
    console.log('TOLERANCE_CHECKED:', tolChk);
    await p.screenshot({ path: 'v51_selected_50.png' });
  }
  
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
