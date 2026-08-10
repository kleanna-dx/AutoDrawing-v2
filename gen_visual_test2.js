const fs = require('fs');
const R = 30;

// Simple helper to draw one case
function drawFilletCase(name, cornerX, cornerY, filletCenterX, filletCenterY, startX, startY, endX, endY) {
  // Draw lines meeting at corner, the fillet arc, and markers
  let s = '';
  
  // Determine line directions from corner
  const dx_start = startX - cornerX;
  const dy_start = startY - cornerY;
  const dx_end = endX - cornerX;
  const dy_end = endY - cornerY;
  
  // Extend lines from corner
  const lineLen = 60;
  const line1EndX = cornerX + (dx_start !== 0 ? Math.sign(dx_start) * lineLen : 0);
  const line1EndY = cornerY + (dy_start !== 0 ? Math.sign(dy_start) * lineLen : 0);
  const line2EndX = cornerX + (dx_end !== 0 ? Math.sign(dx_end) * lineLen : 0);
  const line2EndY = cornerY + (dy_end !== 0 ? Math.sign(dy_end) * lineLen : 0);
  
  // Lines (gray, going through corner)
  s += `<line x1="${line1EndX}" y1="${line1EndY}" x2="${cornerX}" y2="${cornerY}" stroke="#666" stroke-width="1.5"/>`;
  s += `<line x1="${cornerX}" y1="${cornerY}" x2="${line2EndX}" y2="${line2EndY}" stroke="#666" stroke-width="1.5"/>`;
  
  // Fillet arc (red)
  s += `<path d="M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}" stroke="red" stroke-width="2.5" fill="none"/>`;
  
  // Full circle for reference (very light)
  s += `<circle cx="${filletCenterX}" cy="${filletCenterY}" r="${R}" stroke="#ddd" stroke-width="0.5" fill="none" stroke-dasharray="3,3"/>`;
  
  // Center marker (blue)
  s += `<circle cx="${filletCenterX}" cy="${filletCenterY}" r="3" fill="blue"/>`;
  s += `<text x="${filletCenterX+5}" y="${filletCenterY-5}" font-size="9" fill="blue">center</text>`;
  
  // Corner marker (green)
  s += `<circle cx="${cornerX}" cy="${cornerY}" r="3" fill="green"/>`;
  s += `<text x="${cornerX+5}" y="${cornerY+15}" font-size="9" fill="green">corner</text>`;
  
  // Start/End markers
  s += `<circle cx="${startX}" cy="${startY}" r="3" fill="orange"/>`;
  s += `<text x="${startX-25}" y="${startY-5}" font-size="8" fill="orange">S</text>`;
  s += `<circle cx="${endX}" cy="${endY}" r="3" fill="purple"/>`;
  s += `<text x="${endX+5}" y="${endY+12}" font-size="8" fill="purple">E</text>`;
  
  // Title
  s += `<text x="${cornerX}" y="${cornerY - 70}" font-size="11" font-weight="bold" text-anchor="middle">${name}</text>`;
  
  return s;
}

const W = 1200, H = 800;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="white"/>
<text x="600" y="25" font-size="16" font-weight="bold" text-anchor="middle">Boss Fillet R-value: All 8 Cases (sweep=1, R=${R})</text>
<text x="600" y="42" font-size="11" text-anchor="middle" fill="#666">Red=fillet arc, Green=90deg corner, Blue=arc center, Orange=start, Purple=end</text>
`;

// Use reference table values with concrete coordinates
// bLeft=100, bRight=250, bTopY=150, bBotY=300, adjTopY=100, adjBotY=350 (for adjLarger)
// For bossLarger: bTopY=100, bBotY=350, adjTopY=150, adjBotY=300

const cases = [
  // Row 1: adjLarger cases (adj is bigger)
  // Case 1: adjLargerL Top - corner=(bLeft, bTopY)
  { name: 'Case 1: adjLargerL Top', ox: 100, oy: 150,
    corner: [0, 50], center: [R, 50-R], start: [0, 50-R], end: [R, 50] },
  // Case 2: adjLargerL Bot - corner=(bLeft, bBotY)  
  { name: 'Case 2: adjLargerL Bot', ox: 350, oy: 100,
    corner: [0, 100], center: [R, 100+R], start: [R, 100], end: [0, 100+R] },
  // Case 3: adjLargerR Top - corner=(bRight, bTopY)
  { name: 'Case 3: adjLargerR Top', ox: 600, oy: 150,
    corner: [0, 50], center: [-R, 50-R], start: [-R, 50], end: [0, 50-R] },
  // Case 4: adjLargerR Bot - corner=(bRight, bBotY)
  { name: 'Case 4: adjLargerR Bot', ox: 850, oy: 100,
    corner: [0, 100], center: [-R, 100+R], start: [0, 100+R], end: [-R, 100] },

  // Row 2: bossLarger cases (boss is bigger)
  // Case 5: bossLargerL Top - corner=(bLeft, adjTopY)
  { name: 'Case 5: bossLargerL Top', ox: 100, oy: 500,
    corner: [0, 50], center: [-R, 50-R], start: [-R, 50], end: [0, 50-R] },
  // Case 6: bossLargerL Bot - corner=(bLeft, adjBotY)
  { name: 'Case 6: bossLargerL Bot', ox: 350, oy: 450,
    corner: [0, 100], center: [-R, 100+R], start: [0, 100+R], end: [-R, 100] },
  // Case 7: bossLargerR Top - corner=(bRight, adjTopY)
  { name: 'Case 7: bossLargerR Top', ox: 600, oy: 500,
    corner: [0, 50], center: [R, 50-R], start: [0, 50-R], end: [R, 50] },
  // Case 8: bossLargerR Bot - corner=(bRight, adjBotY)
  { name: 'Case 8: bossLargerR Bot', ox: 850, oy: 450,
    corner: [0, 100], center: [R, 100+R], start: [R, 100], end: [0, 100+R] },
];

for (const c of cases) {
  const cx = c.ox + c.corner[0];
  const cy = c.oy + c.corner[1];
  svg += `<g transform="translate(${c.ox},${c.oy})">`;
  svg += drawFilletCase(
    c.name,
    c.corner[0], c.corner[1],
    c.center[0], c.center[1],
    c.start[0], c.start[1],
    c.end[0], c.end[1]
  );
  svg += `</g>`;
}

// Add row labels
svg += `<text x="30" y="80" font-size="13" font-weight="bold" fill="#333">adjLarger (인접 > 보스)</text>`;
svg += `<text x="30" y="430" font-size="13" font-weight="bold" fill="#333">bossLarger (보스 > 인접)</text>`;

svg += '</svg>';

fs.writeFileSync('test_visual_fillets.svg', svg);
console.log('Created test_visual_fillets.svg');

// Convert to PNG
const { execSync } = require('child_process');
try {
  execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'test_visual_fillets.svg\', write_to=\'test_visual_fillets.png\', dpi=150)"', {cwd: '/home/user/webapp'});
  console.log('Converted to test_visual_fillets.png');
} catch(e) {
  console.error('PNG conversion failed:', e.message);
}
