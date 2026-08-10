const fs = require('fs');

// User's concern: Case 5 (bossLargerL Top) - the fillet at the corner 
// where boss is larger than adjacent element on the left

// Simulate the actual scenario:
// Boss: OD=28mm → radius = 14mm
// Adjacent (shaft section): OD=20mm → radius = 10mm
// Boss is larger → bossLargerL case
// R value = 2mm

const PX = 8; // scale: 8 px per mm
const bossR = 14 * PX;  // 112px
const adjR = 10 * PX;   // 80px
const rPx = 2 * PX;     // 16px
const oy = 200;
const bLeft = 100;
const bRight = 200;

const bTopY = oy - bossR;  // 88
const bBotY = oy + bossR;  // 312
const adjTopY = oy - adjR; // 120
const adjBotY = oy + adjR; // 280

// bossLargerL Top: corner=(bLeft, adjTopY)=(100, 120)
// center=(bLeft-R, adjTopY-R) = (84, 104)
// start=(bLeft-R, adjTopY) = (84, 120)
// end=(bLeft, adjTopY-R) = (100, 104)
// sweep=1

const cx = bLeft - rPx;    // 84
const cy = adjTopY - rPx;  // 104
const sx = bLeft - rPx;    // 84
const sy = adjTopY;        // 120
const ex = bLeft;           // 100
const ey = adjTopY - rPx;  // 104

console.log('=== Case 5: bossLargerL Top ===');
console.log(`Boss radius: ${bossR}px (OD=${bossR*2/PX}mm)`);
console.log(`Adj radius:  ${adjR}px (OD=${adjR*2/PX}mm)`);
console.log(`Fillet R:    ${rPx}px (${rPx/PX}mm)`);
console.log(`Corner:      (${bLeft}, ${adjTopY})`);
console.log(`Center:      (${cx}, ${cy})`);
console.log(`Start:       (${sx}, ${sy})`);
console.log(`End:         (${ex}, ${ey})`);
console.log(`Sweep:       1`);

// Verify: center is at distance R from both start and end
const d_center_start = Math.sqrt((cx-sx)**2 + (cy-sy)**2);
const d_center_end = Math.sqrt((cx-ex)**2 + (cy-ey)**2);
const d_center_corner = Math.sqrt((cx-bLeft)**2 + (cy-adjTopY)**2);
console.log(`\nVerification:`);
console.log(`  dist(center, start) = ${d_center_start.toFixed(2)} (should be ${rPx})`);
console.log(`  dist(center, end)   = ${d_center_end.toFixed(2)} (should be ${rPx})`);
console.log(`  dist(center, corner)= ${d_center_corner.toFixed(2)} (should be ${(rPx*Math.sqrt(2)).toFixed(2)} = R√2)`);

// The arc should curve INWARD into the notch
// The notch is the open space above-left of the corner
// The center is above-left of the corner → correct
console.log(`\n  Center is ${cx < bLeft ? 'LEFT' : 'RIGHT'} of corner X (should be LEFT for bossLargerL)`);
console.log(`  Center is ${cy < adjTopY ? 'ABOVE' : 'BELOW'} corner Y (should be ABOVE for Top case)`);
console.log(`  → Center in ${cx < bLeft && cy < adjTopY ? 'UPPER-LEFT' : 'WRONG'} quadrant (should be UPPER-LEFT for bossLargerL Top)`);

// Generate zoomed SVG
const W = 400, H = 400;
const ox_svg = 150, oy_svg = 200;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${bLeft-60} ${adjTopY-60} 150 150">
<rect x="${bLeft-60}" y="${adjTopY-60}" width="150" height="150" fill="white"/>
<text x="${bLeft}" y="${adjTopY-45}" font-size="8" font-weight="bold">Case 5: bossLargerL Top (R=${rPx/PX}mm)</text>
`;

// Boss top horizontal line (goes right from bLeft)
svg += `<line x1="${bLeft}" y1="${bTopY}" x2="${bRight}" y2="${bTopY}" stroke="black" stroke-width="1.5"/>`;
// Boss vertical step line from bTopY to adjTopY-R
svg += `<line x1="${bLeft}" y1="${bTopY}" x2="${bLeft}" y2="${adjTopY - rPx}" stroke="black" stroke-width="1.5"/>`;
// Adjacent horizontal line (goes left from bLeft)
svg += `<line x1="${bLeft - 50}" y1="${adjTopY}" x2="${bLeft - rPx}" y2="${adjTopY}" stroke="#666" stroke-width="1.5"/>`;

// Fillet arc
svg += `<path d="M ${sx} ${sy} A ${rPx} ${rPx} 0 0 1 ${ex} ${ey}" stroke="red" stroke-width="2" fill="none"/>`;

// Full fillet circle (dashed, for reference)
svg += `<circle cx="${cx}" cy="${cy}" r="${rPx}" stroke="#ddd" stroke-width="0.5" fill="none" stroke-dasharray="2,2"/>`;

// Corner marker
svg += `<circle cx="${bLeft}" cy="${adjTopY}" r="2" fill="green"/>`;
svg += `<text x="${bLeft+3}" y="${adjTopY+10}" font-size="6" fill="green">corner(${bLeft},${adjTopY})</text>`;

// Center marker
svg += `<circle cx="${cx}" cy="${cy}" r="2" fill="blue"/>`;
svg += `<text x="${cx-30}" y="${cy-3}" font-size="6" fill="blue">center</text>`;

// Start marker
svg += `<circle cx="${sx}" cy="${sy}" r="2" fill="orange"/>`;
svg += `<text x="${sx-20}" y="${sy+10}" font-size="6" fill="orange">S</text>`;

// End marker
svg += `<circle cx="${ex}" cy="${ey}" r="2" fill="purple"/>`;
svg += `<text x="${ex+3}" y="${ey-3}" font-size="6" fill="purple">E</text>`;

svg += '</svg>';

fs.writeFileSync('test_case5_zoom.svg', svg);

// Convert to PNG
const { execSync } = require('child_process');
try {
  execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'test_case5_zoom.svg\', write_to=\'test_case5_zoom.png\', dpi=300)"', {cwd: '/home/user/webapp'});
  console.log('\nGenerated test_case5_zoom.svg and test_case5_zoom.png');
} catch(e) {
  console.error('PNG failed:', e.message);
}
