// Generate a test SVG with LARGE fillet radius for visual verification
// Uses a simple mock of the drawing model to directly test the fillet logic

const R_MM = 5; // 5mm fillet - large enough to see clearly
const PX = 2;   // pixels per mm

// Simplified shaft geometry
const oy = 200;          // centerline Y
const sectionDiam = 20;  // shaft diameter
const gearDiam = 35;     // gear outer diameter
const boss1Diam = 28;    // boss1 outer diameter
const boss2Diam = 24;    // boss2 outer diameter

const secR = (sectionDiam/2) * PX;
const gearR = (gearDiam/2) * PX;
const boss1R = (boss1Diam/2) * PX;
const boss2R = (boss2Diam/2) * PX;
const rPx = R_MM * PX;

// Positions (simplified)
const gearLeft = 100, gearRight = 200;
const boss1Left = gearRight, boss1Right = 250;
const boss2Left = boss1Right, boss2Right = 290;

const elements = [];

function createOutline(x1, y1, x2, y2) {
  return { x1, y1, x2, y2, _arc: null };
}

// Draw gear outline (simplified rectangle)
elements.push(createOutline(gearLeft, oy - gearR, gearRight, oy - gearR)); // top
elements.push(createOutline(gearLeft, oy + gearR, gearRight, oy + gearR)); // bottom
elements.push(createOutline(gearLeft, oy - gearR, gearLeft, oy + gearR));  // left edge

// Draw boss1 with fillets
// Left: adjacent = gear (larger), Right: adjacent = boss2 (smaller)
const b1TopY = oy - boss1R, b1BotY = oy + boss1R;
const adjLargerL1 = gearR > boss1R;  // true (gear 35 > boss1 28)
const adjLargerR1 = boss2R > boss1R; // false (boss2 24 < boss1 28)

console.log('Boss1: adjLargerL=' + adjLargerL1 + ' adjLargerR=' + adjLargerR1);
console.log('  boss1R=' + boss1R + ' gearR=' + gearR + ' boss2R=' + boss2R);

// Boss1 top horizontal (shortened on left only, since adjLargerL)
const b1TopL = boss1Left + rPx;  // shortened by R (adjLargerL)
const b1TopR = boss1Right;       // NOT shortened (bossLargerR)
elements.push(createOutline(b1TopL, b1TopY, b1TopR, b1TopY));
// Boss1 bottom horizontal
elements.push(createOutline(b1TopL, b1BotY, b1TopR, b1BotY));

// Boss1 LEFT fillets (adjLargerL = true, gear is bigger)
// Top-Left corner: (boss1Left, b1TopY)
{
  const cx = boss1Left + rPx, cy = b1TopY - rPx;
  const a = createOutline(boss1Left, b1TopY - rPx, boss1Left + rPx, b1TopY);
  a._arc = { r: rPx, cx, cy, sweep: 1 };
  elements.push(a);
  
  // Step line: gear adjTopY → (b1TopY - rPx)
  const adjTopY = oy - gearR;
  elements.push(createOutline(boss1Left, adjTopY, boss1Left, b1TopY - rPx));
  
  console.log('  Boss1 Left-Top arc: M ' + boss1Left + ',' + (b1TopY-rPx) + ' A ' + rPx + ' ' + rPx + ' 0 0 1 ' + (boss1Left+rPx) + ',' + b1TopY);
}
// Bottom-Left
{
  const cx = boss1Left + rPx, cy = b1BotY + rPx;
  const a = createOutline(boss1Left + rPx, b1BotY, boss1Left, b1BotY + rPx);
  a._arc = { r: rPx, cx, cy, sweep: 1 };
  elements.push(a);
  
  const adjBotY = oy + gearR;
  elements.push(createOutline(boss1Left, b1BotY + rPx, boss1Left, adjBotY));
  
  console.log('  Boss1 Left-Bot arc: M ' + (boss1Left+rPx) + ',' + b1BotY + ' A ' + rPx + ' ' + rPx + ' 0 0 1 ' + boss1Left + ',' + (b1BotY+rPx));
}

// Boss1 RIGHT fillets (bossLargerR = true, boss1 > boss2)
// Top-Right corner: (boss1Right, adjTopY_R) where adjTopY_R = oy - boss2R
{
  const adjTopY = oy - boss2R;
  const cx = boss1Right + rPx, cy = adjTopY - rPx;
  const a = createOutline(boss1Right, adjTopY - rPx, boss1Right + rPx, adjTopY);
  a._arc = { r: rPx, cx, cy, sweep: 1 };
  elements.push(a);
  
  // Step line: bTopY → (adjTopY - rPx)
  elements.push(createOutline(boss1Right, b1TopY, boss1Right, adjTopY - rPx));
  
  console.log('  Boss1 Right-Top arc: M ' + boss1Right + ',' + (adjTopY-rPx) + ' A ' + rPx + ' ' + rPx + ' 0 0 1 ' + (boss1Right+rPx) + ',' + adjTopY);
}
// Bottom-Right
{
  const adjBotY = oy + boss2R;
  const cx = boss1Right + rPx, cy = adjBotY + rPx;
  const a = createOutline(boss1Right + rPx, adjBotY, boss1Right, adjBotY + rPx);
  a._arc = { r: rPx, cx, cy, sweep: 1 };
  elements.push(a);
  
  elements.push(createOutline(boss1Right, adjBotY + rPx, boss1Right, b1BotY));
  
  console.log('  Boss1 Right-Bot arc: M ' + (boss1Right+rPx) + ',' + adjBotY + ' A ' + rPx + ' ' + rPx + ' 0 0 1 ' + boss1Right + ',' + (adjBotY+rPx));
}

// Draw boss2 (simplified, smaller than boss1)
const b2TopY = oy - boss2R, b2BotY = oy + boss2R;
elements.push(createOutline(boss2Left, b2TopY, boss2Right, b2TopY));
elements.push(createOutline(boss2Left, b2BotY, boss2Right, b2BotY));

// Draw shaft after boss2
elements.push(createOutline(boss2Right, oy - secR, boss2Right + 60, oy - secR));
elements.push(createOutline(boss2Right, oy + secR, boss2Right + 60, oy + secR));
// Step lines for boss2-shaft
elements.push(createOutline(boss2Right, oy - boss2R, boss2Right, oy - secR));
elements.push(createOutline(boss2Right, oy + boss2R, boss2Right, oy + secR));

// Centerline
elements.push({ x1: gearLeft - 20, y1: oy, x2: boss2Right + 80, y2: oy, _arc: null, isCenterline: true });

// Generate SVG
let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="1000" height="800">
<rect width="500" height="400" fill="white"/>
`;

// Draw grid for reference
for (let x = 0; x <= 500; x += 50) {
  svgContent += `<line x1="${x}" y1="0" x2="${x}" y2="400" stroke="#eee" stroke-width="0.5"/>`;
  svgContent += `<text x="${x}" y="395" fill="#ccc" font-size="6">${x}</text>`;
}
for (let y = 0; y <= 400; y += 50) {
  svgContent += `<line x1="0" y1="${y}" x2="500" y2="${y}" stroke="#eee" stroke-width="0.5"/>`;
}

for (const el of elements) {
  if (el.isCenterline) {
    svgContent += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="#999" stroke-width="0.5" stroke-dasharray="8,3,2,3"/>`;
    continue;
  }
  if (el._arc && el._arc.r > 0) {
    const { r, sweep } = el._arc;
    svgContent += `<path d="M ${el.x1} ${el.y1} A ${r} ${r} 0 0 ${sweep} ${el.x2} ${el.y2}" stroke="red" stroke-width="1.5" fill="none"/>`;
    // Draw circle for reference
    svgContent += `<circle cx="${el._arc.cx}" cy="${el._arc.cy}" r="${r}" stroke="#ddd" stroke-width="0.5" stroke-dasharray="2,2" fill="none"/>`;
    // Mark center
    svgContent += `<circle cx="${el._arc.cx}" cy="${el._arc.cy}" r="2" fill="gray"/>`;
    // Mark start/end
    svgContent += `<circle cx="${el.x1}" cy="${el.y1}" r="2" fill="green"/>`;
    svgContent += `<circle cx="${el.x2}" cy="${el.y2}" r="2" fill="blue"/>`;
  } else {
    svgContent += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="black" stroke-width="1"/>`;
  }
}

// Labels
svgContent += `<text x="130" y="30" fill="black" font-size="10" font-family="monospace">Boss Fillet Test (R=${R_MM}mm, ${rPx}px)</text>`;
svgContent += `<text x="130" y="45" fill="black" font-size="8" font-family="monospace">Red=fillet arcs, Green dot=start, Blue dot=end, Gray=circle center</text>`;
svgContent += `<text x="130" y="58" fill="black" font-size="8" font-family="monospace">ALL arcs use sweep=1 (CW). Corner vertex is OUTSIDE the circle.</text>`;

// Label corners
svgContent += `<text x="${boss1Left+2}" y="${b1TopY-2}" fill="blue" font-size="7">adjLargerL top</text>`;
svgContent += `<text x="${boss1Left+2}" y="${b1BotY+10}" fill="blue" font-size="7">adjLargerL bot</text>`;
svgContent += `<text x="${boss1Right+2}" y="${(oy-boss2R)-2}" fill="red" font-size="7">bossLargerR top</text>`;
svgContent += `<text x="${boss1Right+2}" y="${(oy+boss2R)+10}" fill="red" font-size="7">bossLargerR bot</text>`;

svgContent += `</svg>`;

const fs = require('fs');
fs.writeFileSync('test_fillet_correct.svg', svgContent);
console.log('Written test_fillet_correct.svg');
