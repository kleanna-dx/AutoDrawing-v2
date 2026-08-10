const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  // Click DB button to load projects
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    const dbBtn = Array.from(btns).find(b => b.textContent.includes('DB'));
    if (dbBtn) dbBtn.click();
  });
  
  await page.waitForTimeout(2000);
  
  // Click on first project in the list
  const projectClicked = await page.evaluate(() => {
    const items = document.querySelectorAll('.project-item, .db-item, tr, li');
    const clickable = Array.from(items).find(el => el.textContent?.includes('프로젝트') || el.textContent?.includes('계단축'));
    if (clickable) {
      clickable.click();
      return { clicked: true, text: clickable.textContent?.substring(0, 50) };
    }
    // Try clicking any item that appeared after DB click
    const modal = document.querySelector('.modal, .dialog, .popup, [class*="modal"], [class*="dialog"]');
    if (modal) {
      const innerItems = modal.querySelectorAll('div[role="button"], div[class*="item"], tr, li, button');
      if (innerItems.length > 0) {
        innerItems[0].click();
        return { clicked: true, via: 'modalItem', text: innerItems[0].textContent?.substring(0, 50) };
      }
      return { clicked: false, modalHTML: modal.innerHTML?.substring(0, 300) };
    }
    return { clicked: false, note: 'no modal found' };
  });
  
  console.log('Project click:', JSON.stringify(projectClicked, null, 2));
  
  await page.waitForTimeout(5000);
  
  // Check for hidden lines
  const result = await page.evaluate(() => {
    const svg = document.getElementById('drawingSvg');
    const allLines = svg ? svg.querySelectorAll('line') : [];
    const greenDashed = [];
    allLines.forEach(l => {
      const dash = l.getAttribute('stroke-dasharray');
      const stroke = l.getAttribute('stroke');
      if (dash && stroke && stroke.includes('4ade80')) {
        greenDashed.push({
          dash,
          width: l.getAttribute('stroke-width'),
          stroke
        });
      }
    });
    
    return {
      totalLines: allLines.length,
      greenDashedCount: greenDashed.length,
      samples: greenDashed.slice(0, 5)
    };
  });
  
  console.log('Hidden lines:', JSON.stringify(result, null, 2));
  await browser.close();
})();
