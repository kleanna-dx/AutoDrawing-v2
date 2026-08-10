const fs = require('fs');

// Extract the boss fillet area from the generated SVG
const svgContent = fs.readFileSync('test_engine_fillet.svg', 'utf8');

// Get the viewBox or dimensions
const widthMatch = svgContent.match(/width="([^"]+)"/);
const heightMatch = svgContent.match(/height="([^"]+)"/);

// The boss arcs are around x=342-392, y=315-387
// Let's zoom into that area
const zoomX = 330, zoomY = 300, zoomW = 80, zoomH = 100;

// Create a zoomed version
let zoomedSvg = svgContent
  .replace(/width="[^"]*"/, `width="800"`)
  .replace(/height="[^"]*"/, `height="1000"`)
  .replace(/<svg([^>]*)>/, `<svg$1 viewBox="${zoomX} ${zoomY} ${zoomW} ${zoomH}">`);

fs.writeFileSync('test_fillet_zoomed.svg', zoomedSvg);

// Also create a standalone SVG showing just the boss fillet area with annotations
const bossFilletsOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="${zoomX} ${zoomY} ${zoomW} ${zoomH}">
<rect x="${zoomX}" y="${zoomY}" width="${zoomW}" height="${zoomH}" fill="white"/>
<!-- Re-render from source -->
${svgContent.match(/<(line|path|circle|rect)[^/]*\/>/g)?.filter(el => {
  // Only keep elements in the zoom area
  const nums = el.match(/[\d.]+/g)?.map(Number) || [];
  return nums.some(n => n >= zoomX && n <= zoomX + zoomW) || 
         nums.some(n => n >= zoomY && n <= zoomY + zoomH);
}).join('\n') || ''}
</svg>`;

// Convert to PNG
const { execSync } = require('child_process');
try {
  execSync(`python3 -c "import cairosvg; cairosvg.svg2png(url='test_fillet_zoomed.svg', write_to='test_fillet_zoomed.png', dpi=200)"`, {cwd: '/home/user/webapp'});
  console.log('Created test_fillet_zoomed.png');
} catch(e) {
  console.error('Failed:', e.message);
}
