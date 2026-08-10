const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);
  
  // Click demo button  
  const btn = await page.$('button:has-text("데모")');
  if (btn) { await btn.click(); console.log('Clicked demo'); }
  else {
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const txt = await b.textContent();
      console.log(`Button: "${txt}"`);
    }
  }
  await page.waitForTimeout(3000);
  
  // Check for SVG
  const svgEl = await page.$('svg');
  if (!svgEl) {
    console.log('No SVG found!');
    // Take screenshot
    await page.screenshot({ path: 'check_full.png' });
    await browser.close();
    return;
  }
  
  // Full page screenshot
  await page.screenshot({ path: 'check_full.png' });
  
  // Get lines
  const data = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    if (!svg) return { lines: [], circles: [], arcs: [] };
    
    const allLines = svg.querySelectorAll('line');
    const lines = [];
    allLines.forEach(l => {
      const stroke = l.getAttribute('stroke');
      if (stroke === 'transparent' || stroke === '#6b7280') return;
      const x1 = parseFloat(l.getAttribute('x1'));
      const y1 = parseFloat(l.getAttribute('y1'));
      const x2 = parseFloat(l.getAttribute('x2'));
      const y2 = parseFloat(l.getAttribute('y2'));
      if (x1 >= 230 && x1 <= 300 && x2 >= 230 && x2 <= 300 && y1 >= 310 && y2 <= 395) {
        const isVert = Math.abs(x1 - x2) < 0.5;
        const isHoriz = Math.abs(y1 - y2) < 0.5;
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        lines.push({ type: isVert ? 'VERT' : isHoriz ? 'HORIZ' : 'DIAG', x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), len: len.toFixed(2), stroke });
      }
    });
    
    const allCircles = svg.querySelectorAll('circle');
    const circles = [];
    allCircles.forEach(c => {
      const stroke = c.getAttribute('stroke');
      if (stroke === 'transparent') return;
      const cx = parseFloat(c.getAttribute('cx'));
      const cy = parseFloat(c.getAttribute('cy'));
      const r = parseFloat(c.getAttribute('r'));
      if (r > 5) circles.push({ cx: cx.toFixed(1), cy: cy.toFixed(1), r: r.toFixed(1), stroke });
    });
    
    const allPaths = svg.querySelectorAll('path');
    const arcs = [];
    allPaths.forEach(p => {
      const d = p.getAttribute('d');
      const stroke = p.getAttribute('stroke');
      if (stroke === 'transparent') return;
      if (d && d.includes('A')) {
        arcs.push({ d: d.substring(0, 120), stroke });
      }
    });
    
    return { lines, circles, arcs };
  });
  
  console.log('=== LINES ===');
  data.lines.forEach(l => console.log(`${l.type}: (${l.x1},${l.y1})->(${l.x2},${l.y2}) len=${l.len} stroke=${l.stroke}`));
  console.log('\n=== CIRCLES ===');
  data.circles.forEach(c => console.log(`cx=${c.cx}, cy=${c.cy}, r=${c.r}, stroke=${c.stroke}`));
  console.log('\n=== ARCS ===');
  data.arcs.forEach(a => console.log(`d="${a.d}" stroke=${a.stroke}`));
  
  await browser.close();
  console.log('\nDONE');
})();
