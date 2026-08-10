const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  // Click on a project item to load it
  const clicked = await page.evaluate(() => {
    const items = document.querySelectorAll('.project-item, [data-project-id], .sidebar-item');
    if (items.length > 0) {
      items[0].click();
      return { clicked: true, itemCount: items.length, text: items[0].textContent?.substring(0, 50) };
    }
    // Try other selectors
    const links = document.querySelectorAll('a, button, [role="button"]');
    const projectLink = Array.from(links).find(l => l.textContent?.includes('프로젝트') || l.textContent?.includes('project'));
    if (projectLink) {
      projectLink.click();
      return { clicked: true, via: 'projectLink' };
    }
    return { clicked: false, linkTexts: Array.from(links).slice(0, 5).map(l => l.textContent?.substring(0,30)) };
  });
  
  console.log('Click result:', JSON.stringify(clicked, null, 2));
  
  await page.waitForTimeout(5000);
  
  // Now check hidden lines
  const result = await page.evaluate(() => {
    const svg = document.getElementById('drawingSvg');
    const drawingLayer = document.getElementById('drawingLayer');
    const allLines = svg ? svg.querySelectorAll('line') : [];
    const dashedLines = [];
    allLines.forEach(l => {
      const dash = l.getAttribute('stroke-dasharray');
      if (dash) {
        dashedLines.push({
          dash,
          width: l.getAttribute('stroke-width'),
          stroke: l.getAttribute('stroke')
        });
      }
    });
    
    return {
      drawingChildren: drawingLayer ? drawingLayer.childElementCount : 0,
      totalLines: allLines.length,
      dashedLines: dashedLines.length,
      samples: dashedLines.slice(0, 5)
    };
  });
  
  console.log('Lines:', JSON.stringify(result, null, 2));
  await browser.close();
})();
