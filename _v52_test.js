const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Add tolerance to vertical dim ⌀20 and horizontal dim 50
  await p.evaluate(() => {
    const doc = Editor.getDocument();
    const dims = doc.elements.filter(e => e.type === 'dimension');
    // Horizontal 50
    dims[0].tolerance = true;
    dims[0].toleranceUpper = '0.01';
    dims[0].toleranceLower = '0.01';
    // Vertical ⌀20 (first one)
    const diam = dims.find(d => String(d.value).includes('⌀20'));
    if (diam) {
      diam.tolerance = true;
      diam.toleranceUpper = '0.05';
      diam.toleranceLower = '0.05';
    }
    // Vertical ⌀35
    const diam35 = dims.find(d => String(d.value).includes('⌀35'));
    if (diam35) {
      diam35.tolerance = true;
      diam35.toleranceUpper = '0.02';
      diam35.toleranceLower = '0.02';
    }
    Renderer.render(doc);
  });
  await p.waitForTimeout(500);
  
  // Check text positions for vertical dims
  const vertDimTexts = await p.$$eval('.dimension-group text', els => 
    els.filter(e => {
      const fs = parseFloat(e.getAttribute('font-size') || '0');
      const anchor = e.getAttribute('text-anchor');
      return fs >= 5 && (e.textContent.includes('⌀'));
    }).map(e => ({
      text: e.textContent,
      x: e.getAttribute('x'),
      y: e.getAttribute('y'),
      anchor: e.getAttribute('text-anchor')
    }))
  );
  console.log('VERT_DIM_TEXTS:', JSON.stringify(vertDimTexts, null, 2));
  
  // Zoom into vertical dim area
  const svg = await p.$('#drawingSvg');
  const svgBox = await svg.boundingBox();
  await p.mouse.move(svgBox.x + 350, svgBox.y + 400);
  for (let i = 0; i < 14; i++) {
    await p.mouse.wheel(0, -120);
    await p.waitForTimeout(100);
  }
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'v52_vert_dim.png' });
  
  // Also get full view
  await p.evaluate(() => Editor.fitToView());
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'v52_full.png' });
  
  // Click on ⌀20 to test selection
  const d20Info = await p.evaluate(() => {
    const texts = document.querySelectorAll('.dimension-group text');
    for (const t of texts) {
      if (t.textContent === '⌀20') {
        const r = t.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2 };
      }
    }
    return null;
  });
  if (d20Info) {
    await p.mouse.click(d20Info.x, d20Info.y);
    await p.waitForTimeout(500);
    const val = await p.$eval('#propDimValue', el => el.value).catch(() => 'ERR');
    console.log('CLICK_D20:', val);
  }
  
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
