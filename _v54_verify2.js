const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  const result = await page.evaluate(() => {
    const svg = document.getElementById('drawingSvg');
    if (!svg) return { error: 'no SVG' };
    
    // Find all green lines (hidden lines are green #4ade80)
    const allLines = svg.querySelectorAll('line');
    const greenLines = [];
    allLines.forEach(l => {
      const stroke = l.getAttribute('stroke');
      if (stroke && stroke.includes('4ade80')) {
        greenLines.push({
          dash: l.getAttribute('stroke-dasharray'),
          width: l.getAttribute('stroke-width'),
          stroke
        });
      }
    });
    
    // Check groups
    const groups = svg.querySelectorAll('g[data-layer]');
    const layerNames = [];
    groups.forEach(g => layerNames.push(g.getAttribute('data-layer')));
    
    return {
      layers: layerNames,
      greenLineCount: greenLines.length,
      samples: greenLines.slice(0, 5)
    };
  });
  
  console.log('Result:', JSON.stringify(result, null, 2));
  await browser.close();
})();
