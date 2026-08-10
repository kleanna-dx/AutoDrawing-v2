const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  
  // Click demo button
  await page.click('#btnDemoMech');
  await page.waitForTimeout(3000);
  
  // Take full screenshot
  await page.screenshot({ path: 'v53_full.png', fullPage: true });
  
  // Check hidden lines
  const hiddenLines = await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    if (!svg) return { error: 'no SVG' };
    
    const allLines = svg.querySelectorAll('line');
    const greenDashed = [];
    allLines.forEach(l => {
      const stroke = l.getAttribute('stroke');
      const dash = l.getAttribute('stroke-dasharray');
      if (stroke === '#4ade80' && dash) {
        greenDashed.push({
          x1: +l.getAttribute('x1'),
          y1: +l.getAttribute('y1'),
          x2: +l.getAttribute('x2'),
          y2: +l.getAttribute('y2'),
          dash
        });
      }
    });
    return { count: greenDashed.length, lines: greenDashed };
  });
  
  console.log('Hidden lines result:', JSON.stringify(hiddenLines).slice(0, 200));
  console.log('Hidden lines count:', hiddenLines?.count || 0);
  
  if (!hiddenLines?.lines) {
    console.log('NO HIDDEN LINES FOUND - possible rendering issue');
    await page.screenshot({ path: 'v53_debug.png', fullPage: true });
    await browser.close();
    return;
  }
  
  // Categorize lines: horizontal, vertical, diagonal (triangles)
  const horizontal = [];
  const vertical = [];
  const diagonal = [];
  
  hiddenLines.lines.forEach(l => {
    const dx = Math.abs(l.x2 - l.x1);
    const dy = Math.abs(l.y2 - l.y1);
    if (dy < 0.5) horizontal.push(l);
    else if (dx < 0.5) vertical.push(l);
    else diagonal.push(l);
  });
  
  console.log('Horizontal hidden:', horizontal.length);
  console.log('Vertical hidden:', vertical.length);
  console.log('Diagonal hidden (drill triangles):', diagonal.length);
  
  if (diagonal.length > 0) {
    console.log('DRILL TRIANGLES FOUND:');
    diagonal.forEach((d, i) => {
      console.log(`  Triangle line ${i}: (${d.x1.toFixed(1)}, ${d.y1.toFixed(1)}) -> (${d.x2.toFixed(1)}, ${d.y2.toFixed(1)})`);
    });
  }
  
  // Show all hidden lines
  hiddenLines.lines.forEach((l, i) => {
    const type = Math.abs(l.y2 - l.y1) < 0.5 ? 'H' : Math.abs(l.x2 - l.x1) < 0.5 ? 'V' : 'D';
    console.log(`  [${type}] line ${i}: (${l.x1.toFixed(1)}, ${l.y1.toFixed(1)}) -> (${l.x2.toFixed(1)}, ${l.y2.toFixed(1)})`);
  });
  
  // Zoom into tap area
  const tapArea = await page.evaluate(() => {
    const svg = document.querySelector('#drawingSvg');
    const lines = svg.querySelectorAll('line[stroke="#4ade80"]');
    if (lines.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    lines.forEach(l => {
      [+l.getAttribute('x1'), +l.getAttribute('x2')].forEach(x => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); });
      [+l.getAttribute('y1'), +l.getAttribute('y2')].forEach(y => { minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    });
    return { minX, minY, maxX, maxY };
  });
  
  if (tapArea) {
    // Zoom into left tap area only
    const leftLines = hiddenLines.lines.filter(l => l.x1 < (tapArea.minX + tapArea.maxX) / 2 && l.x2 < (tapArea.minX + tapArea.maxX) / 2);
    if (leftLines.length > 0) {
      let lx1 = Infinity, ly1 = Infinity, lx2 = -Infinity, ly2 = -Infinity;
      leftLines.forEach(l => {
        lx1 = Math.min(lx1, l.x1, l.x2);
        ly1 = Math.min(ly1, l.y1, l.y2);
        lx2 = Math.max(lx2, l.x1, l.x2);
        ly2 = Math.max(ly2, l.y1, l.y2);
      });
      await page.evaluate(({x1,y1,x2,y2}) => {
        const svg = document.querySelector('#drawingSvg');
        const pad = 20;
        svg.setAttribute('viewBox', `${x1-pad} ${y1-pad} ${x2-x1+2*pad} ${y2-y1+2*pad}`);
      }, {x1:lx1, y1:ly1, x2:lx2, y2:ly2});
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'v53_tap_left_zoom.png' });
    }
    
    // Zoom into right tap area
    const rightLines = hiddenLines.lines.filter(l => l.x1 > (tapArea.minX + tapArea.maxX) / 2 || l.x2 > (tapArea.minX + tapArea.maxX) / 2);
    if (rightLines.length > 0) {
      let rx1 = Infinity, ry1 = Infinity, rx2 = -Infinity, ry2 = -Infinity;
      rightLines.forEach(l => {
        rx1 = Math.min(rx1, l.x1, l.x2);
        ry1 = Math.min(ry1, l.y1, l.y2);
        rx2 = Math.max(rx2, l.x1, l.x2);
        ry2 = Math.max(ry2, l.y1, l.y2);
      });
      await page.evaluate(({x1,y1,x2,y2}) => {
        const svg = document.querySelector('#drawingSvg');
        const pad = 20;
        svg.setAttribute('viewBox', `${x1-pad} ${y1-pad} ${x2-x1+2*pad} ${y2-y1+2*pad}`);
      }, {x1:rx1, y1:ry1, x2:rx2, y2:ry2});
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'v53_tap_right_zoom.png' });
    }
  }
  
  console.log('JS Errors:', errors.length, errors);
  await browser.close();
})();
