const fs = require('fs');

// Generate an SVG showing all 8 fillet cases with sweep=0 (concave)
const R = 40;
const W = 900, H = 500;
const cases = [];

// Helper: generate SVG arc path
function arcPath(sx, sy, ex, ey, r, sweep) {
  return `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`;
}

// Case 1: adjLargerL Top - corner=(bLeft, bTopY), center=(bLeft+R, bTopY-R)
// start=(bLeft, bTopY-R), end=(bLeft+R, bTopY)
function drawCase(svg, ox, oy, label, cornerX, cornerY, cx, cy, sx, sy, ex, ey, adjLineDir, stepLineDir) {
  // Draw the two perpendicular lines forming the corner
  const lineLen = 80;
  
  // Draw step vertical line (from adj to tangent point on step side)
  if (stepLineDir === 'down') {
    svg.push(`<line x1="${cornerX}" y1="${cornerY - lineLen}" x2="${cornerX}" y2="${sy}" stroke="#333" stroke-width="2"/>`);
  } else if (stepLineDir === 'up') {
    svg.push(`<line x1="${cornerX}" y1="${cornerY + lineLen}" x2="${cornerX}" y2="${sy}" stroke="#333" stroke-width="2"/>`);
  } else if (stepLineDir === 'left') {
    svg.push(`<line x1="${sx}" y1="${cornerY}" x2="${cornerX - lineLen}" y2="${cornerY}" stroke="#333" stroke-width="2"/>`);
  } else if (stepLineDir === 'right') {
    svg.push(`<line x1="${sx}" y1="${cornerY}" x2="${cornerX + lineLen}" y2="${cornerY}" stroke="#333" stroke-width="2"/>`);
  }
  
  // Draw boss horizontal line (from tangent point on boss side)
  if (adjLineDir === 'right') {
    svg.push(`<line x1="${ex}" y1="${cornerY}" x2="${cornerX + lineLen}" y2="${cornerY}" stroke="#333" stroke-width="2"/>`);
  } else if (adjLineDir === 'left') {
    svg.push(`<line x1="${ex}" y1="${cornerY}" x2="${cornerX - lineLen}" y2="${cornerY}" stroke="#333" stroke-width="2"/>`);
  } else if (adjLineDir === 'down') {
    svg.push(`<line x1="${cornerX}" y1="${ey}" x2="${cornerX}" y2="${cornerY + lineLen}" stroke="#333" stroke-width="2"/>`);
  } else if (adjLineDir === 'up') {
    svg.push(`<line x1="${cornerX}" y1="${ey}" x2="${cornerX}" y2="${cornerY - lineLen}" stroke="#333" stroke-width="2"/>`);
  }
  
  // Draw the concave fillet arc (sweep=0)
  const path = arcPath(sx, sy, ex, ey, R, 0);
  svg.push(`<path d="${path}" fill="none" stroke="red" stroke-width="2.5"/>`);
  
  // Mark corner, center, start, end
  svg.push(`<circle cx="${cornerX}" cy="${cornerY}" r="3" fill="green"/>`);
  svg.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="blue"/>`);
  svg.push(`<circle cx="${sx}" cy="${sy}" r="2.5" fill="orange"/>`);
  svg.push(`<circle cx="${ex}" cy="${ey}" r="2.5" fill="purple"/>`);
  
  // Label
  svg.push(`<text x="${ox}" y="${oy + 75}" text-anchor="middle" font-size="11" fill="#333">${label}</text>`);
}

let svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
svg.push(`<rect width="${W}" height="${H}" fill="white"/>`);
svg.push(`<text x="${W/2}" y="25" text-anchor="middle" font-size="16" font-weight="bold">All 8 Fillet Cases with sweep=0 (Concave)</text>`);

// Layout: 4 cases per row, 2 rows
const cols = 4, rowH = 200, colW = 200, startX = 60, startY = 80;

// Row 1: adjLarger cases
// Case 1: adjLargerL Top - corner=(bLeft, bTopY)
// center=(bLeft+R, bTopY-R), start=(bLeft, bTopY-R), end=(bLeft+R, bTopY)
{
  const ox = startX, oy = startY;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "1: adjLargerL Top", cX, cY, cX+R, cY-R, cX, cY-R, cX+R, cY, 'right', 'down');
}

// Case 2: adjLargerL Bot - corner=(bLeft, bBotY)
// center=(bLeft+R, bBotY+R), start=(bLeft+R, bBotY), end=(bLeft, bBotY+R)
{
  const ox = startX + colW, oy = startY;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "2: adjLargerL Bot", cX, cY, cX+R, cY+R, cX+R, cY, cX, cY+R, 'right', 'up');
}

// Case 3: adjLargerR Top - corner=(bRight, bTopY)
// center=(bRight-R, bTopY-R), start=(bRight-R, bTopY), end=(bRight, bTopY-R)
{
  const ox = startX + colW*2, oy = startY;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "3: adjLargerR Top", cX, cY, cX-R, cY-R, cX-R, cY, cX, cY-R, 'left', 'down');
}

// Case 4: adjLargerR Bot - corner=(bRight, bBotY)
// center=(bRight-R, bBotY+R), start=(bRight, bBotY+R), end=(bRight-R, bBotY)
{
  const ox = startX + colW*3, oy = startY;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "4: adjLargerR Bot", cX, cY, cX-R, cY+R, cX, cY+R, cX-R, cY, 'left', 'up');
}

// Row 2: bossLarger cases
// Case 5: bossLargerL Top - corner=(bLeft, adjTopY)
// center=(bLeft-R, adjTopY-R), start=(bLeft-R, adjTopY), end=(bLeft, adjTopY-R)
{
  const ox = startX, oy = startY + rowH;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "5: bossLargerL Top", cX, cY, cX-R, cY-R, cX-R, cY, cX, cY-R, 'left', 'down');
}

// Case 6: bossLargerL Bot - corner=(bLeft, adjBotY)
// center=(bLeft-R, adjBotY+R), start=(bLeft, adjBotY+R), end=(bLeft-R, adjBotY)
{
  const ox = startX + colW, oy = startY + rowH;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "6: bossLargerL Bot", cX, cY, cX-R, cY+R, cX, cY+R, cX-R, cY, 'left', 'up');
}

// Case 7: bossLargerR Top - corner=(bRight, adjTopY)
// center=(bRight+R, adjTopY-R), start=(bRight, adjTopY-R), end=(bRight+R, adjTopY)
{
  const ox = startX + colW*2, oy = startY + rowH;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "7: bossLargerR Top", cX, cY, cX+R, cY-R, cX, cY-R, cX+R, cY, 'right', 'down');
}

// Case 8: bossLargerR Bot - corner=(bRight, adjBotY)
// center=(bRight+R, adjBotY+R), start=(bRight+R, adjBotY), end=(bRight, adjBotY+R)
{
  const ox = startX + colW*3, oy = startY + rowH;
  const cX = ox, cY = oy;
  drawCase(svg, ox, oy, "8: bossLargerR Bot", cX, cY, cX+R, cY+R, cX+R, cY, cX, cY+R, 'right', 'up');
}

// Legend
svg.push(`<text x="30" y="${H-50}" font-size="11" fill="#333">Legend: <tspan fill="green">● corner</tspan> <tspan fill="blue">● center</tspan> <tspan fill="orange">● start</tspan> <tspan fill="purple">● end</tspan> <tspan fill="red">— arc (sweep=0, concave)</tspan></text>`);
svg.push(`<text x="30" y="${H-30}" font-size="11" fill="#333">All arcs curve TOWARD the corner (concave fillet = material removed at inner corner)</text>`);

svg.push(`</svg>`);

fs.writeFileSync('verify_sweep0_cases.svg', svg.join('\n'));
console.log('Created verify_sweep0_cases.svg');

// Convert to PNG
const { execSync } = require('child_process');
try {
  execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'verify_sweep0_cases.svg\', write_to=\'verify_sweep0_cases.png\', output_width=900, output_height=500)"');
  console.log('Created verify_sweep0_cases.png');
} catch(e) {
  console.log('PNG conversion failed, SVG still available');
}
