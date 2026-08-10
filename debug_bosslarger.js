const fs = require('fs');
const { execSync } = require('child_process');

// Let me carefully trace what the bossLarger cases should look like
// based on the user's reference image.
//
// bossLarger: Boss is bigger than adjacent element
// Profile (left side):
//   bTopY   ┌──────────  boss top (boss extends higher)
//            │ x=bLeft (step vertical line)
//   adjTopY ─┘            corner=(bLeft, adjTopY)
//            ← adj
//   adjBotY ─┐            corner=(bLeft, adjBotY)  
//            │
//   bBotY   └──────────
//
// The NOTCH (empty space) is to the LEFT of the step line and between boss and adj.
// The material fills: the boss body (right of step), and adj body (left of step).
//
// For a CONCAVE fillet at corner=(bLeft, adjTopY):
//   The fillet circle must be tangent to the HORIZONTAL line (adjTopY going left)
//   and the VERTICAL line (bLeft going up).
//   The fillet center should be INSIDE the notch = left and up from corner
//   = (bLeft - R, adjTopY - R)
//   BUT WAIT - the user's image shows the arc curving toward the corner...
//   
// Let me look at it differently. The user's reference (left side) shows:
// adjLarger works correctly. The arc starts on vertical line, curves to horizontal line,
// and the curve bends TOWARD the corner (concave = material removed).
//
// For bossLarger, the corner shape is MIRRORED.
// The notch opens in the OPPOSITE direction.
//
// Current code for bossLargerL Top:
//   center=(bLeft-R, adjTopY-R)  -- this is LEFT and UP from corner
//   start=(bLeft-R, adjTopY)     -- on horizontal line, R to the left
//   end=(bLeft, adjTopY-R)       -- on vertical line, R above
//   sweep=0
//
// The problem: center is at (bLeft-R, adjTopY-R), which is in the OUTER space
// (above and left), but the notch for bossLarger is also to the LEFT.
// So the center IS in the notch... and sweep=0 should curve toward corner.
// 
// Let me draw both and see what happens visually.

const W = 800, H = 500;
const R = 30;

let svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
svg.push(`<rect width="${W}" height="${H}" fill="white"/>`);
svg.push(`<text x="${W/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold">bossLarger Debug: Current code vs ALL sweep options</text>`);

// ========== bossLargerL Top ==========
// Profile:
//   bTopY=60  ┌──────── (boss extends up)
//              │ x=200 (step)
//   adjTopY=130 ─┘  corner
//              ← adj extends left

// Current code: center=(bLeft-R, adjTopY-R), start=(bLeft-R, adjTopY), end=(bLeft, adjTopY-R)
const bLeft = 200, adjTopY = 150, bTopY = 80;
const cx = bLeft - R, cy = adjTopY - R;
const sx = bLeft - R, sy = adjTopY;
const ex = bLeft, ey = adjTopY - R;

function drawBossLargerTopCase(offsetX, offsetY, sweep, label) {
  const dx = offsetX, dy = offsetY;
  
  // Boss top line
  svg.push(`<line x1="${100+dx}" y1="${bTopY+dy}" x2="${bLeft+dx}" y2="${bTopY+dy}" stroke="black" stroke-width="2"/>`);
  // Step vertical: bTopY → (adjTopY-R) with shortening
  svg.push(`<line x1="${bLeft+dx}" y1="${bTopY+dy}" x2="${bLeft+dx}" y2="${ey+dy}" stroke="black" stroke-width="2"/>`);
  // Adj horizontal line going left from tangent point
  svg.push(`<line x1="${20+dx}" y1="${adjTopY+dy}" x2="${sx+dx}" y2="${adjTopY+dy}" stroke="black" stroke-width="2"/>`);
  
  // The arc
  svg.push(`<path d="M ${sx+dx} ${sy+dy} A ${R} ${R} 0 0 ${sweep} ${ex+dx} ${ey+dy}" fill="none" stroke="red" stroke-width="3"/>`);
  
  // Corner marker
  svg.push(`<circle cx="${bLeft+dx}" cy="${adjTopY+dy}" r="4" fill="green"/>`);
  // Center marker
  svg.push(`<circle cx="${cx+dx}" cy="${cy+dy}" r="3" fill="blue"/>`);
  
  svg.push(`<text x="${100+dx}" y="${adjTopY+dy+40}" font-size="12" fill="#333">${label}</text>`);
}

drawBossLargerTopCase(0, 0, 0, "bossLargerL Top: current center, sweep=0");
drawBossLargerTopCase(400, 0, 1, "bossLargerL Top: current center, sweep=1");

// Now try with center on the OTHER side: center=(bLeft+R, adjTopY-R)
// Which would be RIGHT and UP from corner - inside the material
const cx2 = bLeft + R, cy2 = adjTopY - R;
const sx2 = bLeft, sy2 = adjTopY - R;  // on vertical line
const ex2 = bLeft + R, ey2 = adjTopY;  // on horizontal line (but going right into boss?)

// Actually let me think about this differently.
// In bossLarger, the step at bLeft has:
//   - Boss top horizontal going LEFT from bLeft
//   - Step vertical going DOWN from bTopY to adjTopY
//   - Adj horizontal going LEFT from adjTopY
// 
// The INNER CORNER is at (bLeft, adjTopY)
// Two walls meeting: vertical (going up) and horizontal (going left)
// The notch (empty space) is to the LEFT and UP from adj line level
// 
// For concave fillet: 
//   The fillet circle center should be at (bLeft-R, adjTopY+R) if notch is left-below
//   No wait...
//
// Let me just try ALL possible center positions

function drawCase(offsetX, offsetY, pcx, pcy, psx, psy, pex, pey, sweep, label) {
  const dx = offsetX, dy = offsetY;
  
  // Boss top line
  svg.push(`<line x1="${100+dx}" y1="${bTopY+dy}" x2="${bLeft+dx}" y2="${bTopY+dy}" stroke="black" stroke-width="2"/>`);
  // Step vertical
  svg.push(`<line x1="${bLeft+dx}" y1="${bTopY+dy}" x2="${bLeft+dx}" y2="${pey+dy}" stroke="black" stroke-width="2"/>`);
  // Adj horizontal
  svg.push(`<line x1="${20+dx}" y1="${adjTopY+dy}" x2="${psx+dx}" y2="${adjTopY+dy}" stroke="black" stroke-width="2"/>`);
  
  // Arc
  svg.push(`<path d="M ${psx+dx} ${psy+dy} A ${R} ${R} 0 0 ${sweep} ${pex+dx} ${pey+dy}" fill="none" stroke="red" stroke-width="3"/>`);
  
  // Corner
  svg.push(`<circle cx="${bLeft+dx}" cy="${adjTopY+dy}" r="4" fill="green"/>`);
  // Center
  svg.push(`<circle cx="${pcx+dx}" cy="${pcy+dy}" r="3" fill="blue"/>`);
  
  svg.push(`<text x="${60+dx}" y="${adjTopY+dy+35}" font-size="10" fill="#333">${label}</text>`);
}

// Row 2: Try center inside material = (bLeft+R, adjTopY+R)
// start=(bLeft, adjTopY+R) on vertical below corner
// end=(bLeft+R, adjTopY) on horizontal right of corner
drawCase(0, 200, bLeft+R, adjTopY+R, bLeft, adjTopY+R, bLeft+R, adjTopY, 0, "center=(+R,+R) sweep=0");
drawCase(200, 200, bLeft+R, adjTopY+R, bLeft, adjTopY+R, bLeft+R, adjTopY, 1, "center=(+R,+R) sweep=1");

// center=(bLeft-R, adjTopY+R)
drawCase(400, 200, bLeft-R, adjTopY+R, bLeft-R, adjTopY, bLeft, adjTopY+R, 0, "center=(-R,+R) sweep=0");
drawCase(600, 200, bLeft-R, adjTopY+R, bLeft-R, adjTopY, bLeft, adjTopY+R, 1, "center=(-R,+R) sweep=1");

svg.push(`</svg>`);

fs.writeFileSync('debug_bosslarger.svg', svg.join('\n'));
execSync(`python3 -c "import cairosvg; cairosvg.svg2png(url='debug_bosslarger.svg', write_to='debug_bosslarger.png', output_width=800, output_height=500)"`);
console.log('Created debug_bosslarger.png');
