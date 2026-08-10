const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  // Click demo button
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Full drawing screenshot
  await p.screenshot({ path: 'v51_full.png' });
  
  // Get tolerance text details
  const tolTexts = await p.$$eval('text', els => 
    els.filter(e => e.textContent && (e.textContent.includes('+') || e.textContent.includes('-')) && e.textContent.length < 10)
        .map(e => ({
          text: e.textContent,
          x: e.getAttribute('x'),
          y: e.getAttribute('y'),
          fontSize: e.getAttribute('font-size')
        }))
  );
  console.log('TOLERANCE_TEXTS:', JSON.stringify(tolTexts, null, 2));
  
  // Count hit rects
  const hitRects = await p.$$eval('rect[fill="transparent"]', els => els.length);
  console.log('HIT_RECT_COUNT:', hitRects);
  
  // Get all dimension values
  const dimTexts = await p.$$eval('.dimension-group text', els => 
    els.map(e => ({
      text: e.textContent,
      x: parseFloat(e.getAttribute('x')),
      y: parseFloat(e.getAttribute('y')),
      fontSize: e.getAttribute('font-size')
    })).filter(e => e.text && !e.text.includes('+') && !e.text.includes('-'))
  );
  console.log('DIM_TEXTS:', JSON.stringify(dimTexts, null, 2));
  
  await b.close();
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
