const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(5000);
  
  // Check if we have project data loaded
  const result = await page.evaluate(() => {
    const svg = document.getElementById('drawingSvg');
    if (!svg) return { error: 'no SVG' };
    
    const allLines = svg.querySelectorAll('line');
    const dashedLines = [];
    allLines.forEach(l => {
      const dash = l.getAttribute('stroke-dasharray');
      const stroke = l.getAttribute('stroke');
      if (dash) {
        dashedLines.push({
          dash,
          width: l.getAttribute('stroke-width'),
          stroke
        });
      }
    });
    
    // Check total SVG children
    const totalChildren = svg.childElementCount;
    
    // Check drawingLayer
    const drawingLayer = document.getElementById('drawingLayer');
    const drawingChildren = drawingLayer ? drawingLayer.childElementCount : 0;
    
    return {
      totalSvgChildren: totalChildren,
      drawingLayerChildren: drawingChildren,
      dashedLineCount: dashedLines.length,
      samples: dashedLines.slice(0, 8),
      svgInnerHTML_snippet: svg.innerHTML.substring(0, 500)
    };
  });
  
  console.log('Result:', JSON.stringify(result, null, 2));
  await browser.close();
})();
