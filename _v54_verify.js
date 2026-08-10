const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  const result = await page.evaluate(() => {
    const svg = document.getElementById('drawingSvg');
    if (!svg) return { error: 'no SVG' };
    
    const hiddenGroup = svg.querySelector('[data-layer="hiddenlines"]');
    if (!hiddenGroup) return { error: 'no hiddenlines group' };
    
    const lines = hiddenGroup.querySelectorAll('line:not([stroke=transparent])');
    const info = [];
    lines.forEach(l => {
      info.push({
        dash: l.getAttribute('stroke-dasharray'),
        width: l.getAttribute('stroke-width'),
        stroke: l.getAttribute('stroke')
      });
    });
    
    return {
      count: lines.length,
      samples: info.slice(0, 5)
    };
  });
  
  console.log('Hidden lines:', JSON.stringify(result, null, 2));
  await browser.close();
})();
