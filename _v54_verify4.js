const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // Try clicking on the project to load it, or trigger render
  const result = await page.evaluate(() => {
    // Try to access the app's render function
    if (typeof window.App !== 'undefined' && window.App.render) {
      window.App.render();
    }
    // Check if Renderer is available
    if (typeof window.Renderer !== 'undefined' && window.Renderer.render) {
      // Try to get the document model
      if (typeof window.DrawingModel !== 'undefined') {
        const doc = window.DrawingModel.getDocument();
        return {
          docElements: doc ? doc.elements?.length : 0,
          hasRenderer: true
        };
      }
    }
    return { note: 'checking global objects', keys: Object.keys(window).filter(k => k.startsWith('App') || k.startsWith('Draw') || k.startsWith('Render')).join(', ') };
  });
  
  console.log('App state:', JSON.stringify(result, null, 2));
  
  // Wait longer for auto-restore
  await page.waitForTimeout(5000);
  
  const result2 = await page.evaluate(() => {
    const svg = document.getElementById('drawingSvg');
    const drawingLayer = document.getElementById('drawingLayer');
    return {
      drawingChildren: drawingLayer ? drawingLayer.childElementCount : 0,
      totalLines: svg ? svg.querySelectorAll('line').length : 0
    };
  });
  
  console.log('After wait:', JSON.stringify(result2, null, 2));
  await browser.close();
})();
