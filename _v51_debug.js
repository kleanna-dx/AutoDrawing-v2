const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  
  // Capture console errors
  const errors = [];
  p.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  p.on('pageerror', err => errors.push('PAGE_ERR: ' + err.message));
  
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Get all dimension elements info
  const dimInfo = await p.evaluate(() => {
    const doc = Editor.getDocument();
    if (!doc) return 'NO_DOC';
    const dims = doc.elements.filter(e => e.type === 'dimension');
    return dims.map(d => ({
      id: d.id,
      value: d.value,
      x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2,
      offset: d.offset,
      isHorizontal: Math.abs(d.y2 - d.y1) < Math.abs(d.x2 - d.x1),
      fontSize: d.fontSize
    }));
  });
  console.log('DIMS:', JSON.stringify(dimInfo, null, 2));
  
  // Try clicking on each dimension text and check if it gets selected
  const clickResults = [];
  for (const dim of dimInfo) {
    // Calculate text screen position
    const result = await p.evaluate((dimId) => {
      const texts = document.querySelectorAll('.dimension-group text');
      for (const t of texts) {
        // Find the group's parent data-id
        const group = t.closest('.dimension-group') || t.parentElement;
        if (t.textContent && group) {
          const rect = t.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return {
              text: t.textContent,
              screenX: rect.x + rect.width / 2,
              screenY: rect.y + rect.height / 2,
              w: rect.width,
              h: rect.height
            };
          }
        }
      }
      return null;
    }, dim.id);
  }
  
  // Simpler approach: click all dim text elements and check selection
  const allDimTexts = await p.$$eval('.dimension-group text', els => 
    els.filter(e => {
      const fs = parseFloat(e.getAttribute('font-size') || '0');
      return fs >= 5; // main dim text only
    }).map(e => {
      const r = e.getBoundingClientRect();
      return {
        text: e.textContent,
        cx: r.x + r.width / 2,
        cy: r.y + r.height / 2,
        w: r.width,
        h: r.height
      };
    })
  );
  
  console.log('ALL_DIM_TEXTS:', JSON.stringify(allDimTexts, null, 2));
  
  // Click on first dim text ("50")
  const t50 = allDimTexts.find(d => d.text === '50');
  if (t50) {
    console.log('CLICKING_50_AT:', t50.cx, t50.cy);
    await p.mouse.click(t50.cx, t50.cy);
    await p.waitForTimeout(500);
    
    const selPanel = await p.$eval('#panelSelection', el => el.style.display).catch(() => 'ERR');
    const selInfo = await p.$eval('#selectedInfo', el => el.style.display).catch(() => 'ERR');
    console.log('AFTER_CLICK_50:', { selPanel, selInfo });
    
    // Check if propDimValue has the value
    const dimVal = await p.$eval('#propDimValue', el => el.value).catch(() => 'ERR');
    console.log('DIM_VALUE:', dimVal);
  } else {
    console.log('50_NOT_FOUND');
  }
  
  // Also click on ⌀17 if present
  const t17 = allDimTexts.find(d => d.text.includes('17'));
  if (t17) {
    await p.mouse.click(100, 100); // deselect first
    await p.waitForTimeout(300);
    console.log('CLICKING_17_AT:', t17.cx, t17.cy);
    await p.mouse.click(t17.cx, t17.cy);
    await p.waitForTimeout(500);
    const dimVal = await p.$eval('#propDimValue', el => el.value).catch(() => 'ERR');
    console.log('DIM17_VALUE:', dimVal);
  }
  
  console.log('JS_ERRORS:', JSON.stringify(errors));
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
