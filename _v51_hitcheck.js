const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  await p.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  // Click demo button
  await p.click('#btnDemoMech', { timeout: 10000 });
  await p.waitForTimeout(5000);
  
  // Now test clicking on a dimension text to see if selection works
  // First, find the Ø20 dimension on the S1 shaft area (first one around x=372.5)
  const dimInfo = await p.evaluate(() => {
    const dimTexts = document.querySelectorAll('.dimension-group text');
    const results = [];
    dimTexts.forEach(t => {
      const r = t.getBoundingClientRect();
      results.push({
        text: t.textContent,
        screenX: r.x + r.width/2,
        screenY: r.y + r.height/2,
        svgX: parseFloat(t.getAttribute('x')),
        svgY: parseFloat(t.getAttribute('y'))
      });
    });
    return results;
  });
  
  // Click on first Ø20 dim text
  const d20 = dimInfo.find(d => d.text === '⌀20');
  if (d20) {
    await p.mouse.click(d20.screenX, d20.screenY);
    await p.waitForTimeout(500);
    
    // Check if selection panel shows
    const selPanel = await p.$eval('#panelSelection', el => el.style.display);
    const dimSection = await p.$eval('#propDimensionSection', el => el.style.display);
    console.log('CLICK_ON_D20:', { selPanel, dimSection });
    
    // Check selected value
    const dimValue = await p.$eval('#propDimValue', el => el.value);
    console.log('SELECTED_DIM_VALUE:', dimValue);
    
    await p.screenshot({ path: 'v51_selected.png' });
  } else {
    console.log('D20_NOT_FOUND');
  }
  
  // Now try clicking on a different area to deselect
  await p.mouse.click(100, 100);
  await p.waitForTimeout(300);
  
  // Click on ⌀35 (should be a separate selectable dim)
  const d35 = dimInfo.find(d => d.text === '⌀35');
  if (d35) {
    await p.mouse.click(d35.screenX, d35.screenY);
    await p.waitForTimeout(500);
    const dimValue = await p.$eval('#propDimValue', el => el.value);
    console.log('CLICK_ON_D35:', dimValue);
  }
  
  // Check JS errors
  const errors = [];
  p.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await b.close();
  console.log('ERRORS:', errors.length);
  console.log('DONE');
})().catch(e => { console.error(e.message); process.exit(1); });
