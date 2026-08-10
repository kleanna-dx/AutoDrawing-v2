const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000);
  const btn = await page.$('button:has-text("데모")');
  if (btn) await btn.click();
  await page.waitForTimeout(3000);
  
  // Get lines in gear front-view area
  const data = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    if (!svg) return { lines: [], arcsByR: {} };
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
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        lines.push({ type: isVert ? 'VERT' : Math.abs(y1-y2) < 0.5 ? 'HORIZ' : 'DIAG', x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), len: len.toFixed(2), stroke });
      }
    });
    const allPaths = svg.querySelectorAll('path');
    const arcsByR = {};
    allPaths.forEach(p => {
      const d = p.getAttribute('d');
      const stroke = p.getAttribute('stroke');
      if (stroke === 'transparent') return;
      if (d && d.includes('A')) {
        const match = d.match(/A\s+([\d.]+)\s+([\d.]+)/);
        if (match) { const r = parseFloat(match[1]).toFixed(1); arcsByR[r] = (arcsByR[r] || 0) + 1; }
      }
    });
    return { lines, arcsByR };
  });
  
  console.log('=== GEAR FRONT VIEW LINES ===');
  data.lines.forEach(l => console.log(`${l.type}: (${l.x1},${l.y1})->(${l.x2},${l.y2}) len=${l.len} stroke=${l.stroke}`));
  console.log('\n=== ARC COUNTS ===');
  for (const [r, count] of Object.entries(data.arcsByR)) console.log(`r=${r}: ${count}`);
  
  // Screenshots
  await page.screenshot({ path: 'v47_gear_boss.png', clip: { x: 130, y: 310, width: 350, height: 250 } });
  await page.screenshot({ path: 'v47_front_zoom.png', clip: { x: 270, y: 350, width: 120, height: 150 } });
  
  await browser.close();
  console.log('\nDONE');
})();
