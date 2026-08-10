const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000);
  const demoBtn = await page.$('button:has-text("데모")');
  if (demoBtn) await demoBtn.click();
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const container = document.querySelector('#canvasContainer');
    
    return {
      svgViewBox: svg.getAttribute('viewBox'),
      svgWidth: svg.getAttribute('width'),
      svgHeight: svg.getAttribute('height'),
      svgStyle: svg.getAttribute('style'),
      svgTransform: svg.getAttribute('transform'),
      containerScroll: container ? { scrollTop: container.scrollTop, scrollLeft: container.scrollLeft } : null,
      containerSize: container ? { w: container.clientWidth, h: container.clientHeight, scrollW: container.scrollWidth, scrollH: container.scrollHeight } : null,
      // Check if svg has a transform group
      firstG: svg.querySelector('g') ? svg.querySelector('g').getAttribute('transform') : null,
      // Check zoom level
      zoomEl: document.querySelector('[data-zoom]')?.dataset.zoom || null,
      // Get all circle positions in screen coords
      circleScreenPos: Array.from(svg.querySelectorAll('circle')).filter(c => parseFloat(c.getAttribute('r')) > 10).map(c => {
        const rect = c.getBoundingClientRect();
        return { cx: rect.x + rect.width/2, cy: rect.y + rect.height/2, r: parseFloat(c.getAttribute('r')), screenW: rect.width };
      })
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  
  // If there are circles, try to capture around them
  if (info.circleScreenPos.length > 0) {
    const c = info.circleScreenPos[0]; // bore circle
    console.log('Bore circle screen center:', c.cx, c.cy, 'screen width:', c.screenW);
    
    // Capture around the bore circle (which should be near gear center)
    const margin = 100;
    const halfR = c.screenW / 2;
    await page.screenshot({
      path: '_z3_around_bore.png',
      clip: { 
        x: Math.max(0, c.cx - halfR - margin),
        y: Math.max(0, c.cy - halfR - margin),
        width: (halfR + margin) * 2,
        height: (halfR + margin) * 2
      }
    });
    console.log('Screenshot saved');
  }
  
  await browser.close();
})();
