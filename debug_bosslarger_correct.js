const fs = require('fs');
const { execSync } = require('child_process');

// Based on the debug: for bossLargerL Top, the correct one is:
// center=(bLeft+R, adjTopY+R), start=(bLeft, adjTopY+R), end=(bLeft+R, adjTopY), sweep=1
//
// This means the fillet circle center is on the MATERIAL side (inside the boss),
// NOT in the notch. And sweep=1 curves toward the corner = concave.
//
// Let me now work out ALL 4 bossLarger cases correctly and compare with adjLarger:

const W = 800, H = 600;
const R = 25;

let svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
svg.push(`<rect width="${W}" height="${H}" fill="white"/>`);
svg.push(`<text x="${W/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold">Correct Concave Fillets: adjLarger(sweep=0) vs bossLarger(sweep=1)</text>`);

// ===== adjLargerL Top (CORRECT - sweep=0) =====
// Profile: gear taller, boss shorter
// adjTopY ──────┐
//               │ x=bLeft step
// bTopY   ─────┘  corner=(bLeft, bTopY)
//          boss→
// center=(bLeft+R, bTopY-R), start=(bLeft, bTopY-R), end=(bLeft+R, bTopY), sweep=0
{
  const ox=50, oy=60;
  const stepX=150, bTopY2=130;
  svg.push(`<line x1="${ox}" y1="${oy}" x2="${stepX}" y2="${oy}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX}" y1="${oy}" x2="${stepX}" y2="${bTopY2-R}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX+R}" y1="${bTopY2}" x2="${stepX+100}" y2="${bTopY2}" stroke="black" stroke-width="2"/>`);
  svg.push(`<path d="M ${stepX} ${bTopY2-R} A ${R} ${R} 0 0 0 ${stepX+R} ${bTopY2}" fill="none" stroke="red" stroke-width="2.5"/>`);
  svg.push(`<circle cx="${stepX}" cy="${bTopY2}" r="3" fill="green"/>`);
  svg.push(`<text x="${ox}" y="${bTopY2+30}" font-size="11">adjLargerL Top: sweep=0 ✓</text>`);
}

// ===== adjLargerL Bot (CORRECT - sweep=0) =====
{
  const ox=50, oy=220;
  const stepX=150, bBotY2=oy-30;
  svg.push(`<line x1="${stepX+R}" y1="${bBotY2}" x2="${stepX+100}" y2="${bBotY2}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX}" y1="${bBotY2+R}" x2="${stepX}" y2="${oy+40}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${ox}" y1="${oy+40}" x2="${stepX}" y2="${oy+40}" stroke="black" stroke-width="2"/>`);
  svg.push(`<path d="M ${stepX+R} ${bBotY2} A ${R} ${R} 0 0 0 ${stepX} ${bBotY2+R}" fill="none" stroke="red" stroke-width="2.5"/>`);
  svg.push(`<circle cx="${stepX}" cy="${bBotY2}" r="3" fill="green"/>`);
  svg.push(`<text x="${ox}" y="${oy+70}" font-size="11">adjLargerL Bot: sweep=0 ✓</text>`);
}

// ===== bossLargerL Top (NEEDS FIX) =====
// Profile: boss taller, adj shorter
// bTopY   ┌────────── boss top
//          │ x=bLeft step
// adjTopY ─┘  corner=(bLeft, adjTopY)
//          ← adj
//
// The corner is where vertical line meets adj horizontal going LEFT.
// Material is: boss body to the RIGHT, adj body below-left.
// The fillet should curve INTO the corner.
//
// CORRECT: center=(bLeft+R, adjTopY+R) [inside material, below-right of corner]
// start=(bLeft, adjTopY+R) [on vertical line, R below corner]
// end=(bLeft+R, adjTopY) [on horizontal line, R to the right of corner]
// sweep=1
//
// Wait - but the adj horizontal goes LEFT from corner, not right.
// The step vertical goes UP from corner.
// The fillet must connect: step vertical (going up from adjTopY) with adj horizontal (going left from bLeft)
//
// Tangent points:
// On vertical line at x=bLeft: (bLeft, adjTopY-R) -- R above corner
// On horizontal line at y=adjTopY: (bLeft-R, adjTopY) -- R to the left
// Center: (bLeft-R, adjTopY-R) -- current code, NOT WORKING with sweep=0
//
// OR: use center=(bLeft+R, adjTopY+R), tangent on vert=(bLeft, adjTopY+R), tangent on horiz=(bLeft+R, adjTopY)
// But adjTopY+R is BELOW adjTopY... that's not on the step line which goes UP.
// And bLeft+R is to the RIGHT... that's into the boss body, not on the adj line.
//
// Hmm. The issue is the two lines that form the corner:
// Line 1: vertical at x=bLeft, going from bTopY DOWN to adjTopY
// Line 2: horizontal at y=adjTopY, going from some point LEFT to bLeft
//
// These two lines meet at corner=(bLeft, adjTopY).
// For a fillet tangent to both lines:
// Center must be at distance R from both lines.
// From vertical line x=bLeft: center_x = bLeft ± R
// From horizontal line y=adjTopY: center_y = adjTopY ± R
//
// 4 possible centers:
// A: (bLeft-R, adjTopY-R) = up-left (in the notch/empty space)
// B: (bLeft+R, adjTopY-R) = up-right (inside boss body above adj level)
// C: (bLeft-R, adjTopY+R) = down-left (below adj line, left of step)
// D: (bLeft+R, adjTopY+R) = down-right (inside boss body below adj level)

// For concave fillet (arc curves toward corner):
// The center should be on the OPPOSITE side of the corner from the notch.
// The notch is up-left (where boss extends above adj).
// So center should be D: (bLeft+R, adjTopY+R) = down-right.
// Tangent points: (bLeft, adjTopY+R) and (bLeft+R, adjTopY)
// But wait - (bLeft, adjTopY+R) is NOT on the existing step line (which goes UP from adjTopY)
// and (bLeft+R, adjTopY) is NOT on the existing adj line (which goes LEFT from bLeft).
//
// AH - I think the issue is: for a CONCAVE fillet that removes material at the inner corner,
// the center IS in the notch (empty space), and the tangent points are R distance from corner
// along each line going AWAY from corner into the existing geometry.
// center = A: (bLeft-R, adjTopY-R)
// Tangent on adj horiz: (bLeft-R, adjTopY) - R to the left = on adj line ✓
// Tangent on step vert: (bLeft, adjTopY-R) - R above = on step line ✓
// 
// With this center, we need the arc to curve INWARD toward the corner.
// From the debug image, sweep=1 achieves this for center in notch.

// Let me verify with a clean diagram
{
  const ox=420, oy=60;
  const stepX=550, adjTopY2=130, bTopY2=oy;
  
  // Boss top horizontal going left
  svg.push(`<line x1="${ox}" y1="${bTopY2}" x2="${stepX}" y2="${bTopY2}" stroke="black" stroke-width="2"/>`);
  // Step vertical: bTopY → adjTopY-R
  svg.push(`<line x1="${stepX}" y1="${bTopY2}" x2="${stepX}" y2="${adjTopY2-R}" stroke="black" stroke-width="2"/>`);
  // Adj horizontal going left from (stepX-R, adjTopY)
  svg.push(`<line x1="${ox}" y1="${adjTopY2}" x2="${stepX-R}" y2="${adjTopY2}" stroke="black" stroke-width="2"/>`);
  
  // Center in notch: (stepX-R, adjTopY-R)
  // start=(stepX-R, adjTopY) [on horiz line], end=(stepX, adjTopY-R) [on vert line]
  // sweep=1 for concave toward corner
  svg.push(`<path d="M ${stepX-R} ${adjTopY2} A ${R} ${R} 0 0 1 ${stepX} ${adjTopY2-R}" fill="none" stroke="red" stroke-width="2.5"/>`);
  svg.push(`<circle cx="${stepX}" cy="${adjTopY2}" r="3" fill="green"/>`);
  svg.push(`<circle cx="${stepX-R}" cy="${adjTopY2-R}" r="3" fill="blue"/>`);
  svg.push(`<text x="${ox}" y="${adjTopY2+30}" font-size="11">bossLargerL Top: sweep=1, center in notch ← CORRECT?</text>`);
}

// ===== bossLargerL Bot (same logic mirrored) =====
{
  const ox=420, oy=220;
  const stepX=550, adjBotY2=oy-30, bBotY2=oy+40;
  
  // Adj horizontal going left
  svg.push(`<line x1="${ox}" y1="${adjBotY2}" x2="${stepX-R}" y2="${adjBotY2}" stroke="black" stroke-width="2"/>`);
  // Step vertical: adjBotY+R → bBotY
  svg.push(`<line x1="${stepX}" y1="${adjBotY2+R}" x2="${stepX}" y2="${bBotY2}" stroke="black" stroke-width="2"/>`);
  // Boss bottom horizontal going left
  svg.push(`<line x1="${ox}" y1="${bBotY2}" x2="${stepX}" y2="${bBotY2}" stroke="black" stroke-width="2"/>`);
  
  // Center in notch: (stepX-R, adjBotY+R)
  // start=(stepX, adjBotY+R) [on vert line], end=(stepX-R, adjBotY) [on horiz line]
  // sweep=1
  svg.push(`<path d="M ${stepX} ${adjBotY2+R} A ${R} ${R} 0 0 1 ${stepX-R} ${adjBotY2}" fill="none" stroke="red" stroke-width="2.5"/>`);
  svg.push(`<circle cx="${stepX}" cy="${adjBotY2}" r="3" fill="green"/>`);
  svg.push(`<circle cx="${stepX-R}" cy="${adjBotY2+R}" r="3" fill="blue"/>`);
  svg.push(`<text x="${ox}" y="${oy+70}" font-size="11">bossLargerL Bot: sweep=1, center in notch ← CORRECT?</text>`);
}

// Summary
svg.push(`<text x="${W/2}" y="${H-40}" text-anchor="middle" font-size="12" fill="red">Key insight: adjLarger uses sweep=0, bossLarger needs sweep=1</text>`);
svg.push(`<text x="${W/2}" y="${H-20}" text-anchor="middle" font-size="12" fill="red">Both have center in the notch, but corner orientation differs!</text>`);

svg.push(`</svg>`);

fs.writeFileSync('debug_bosslarger_correct.svg', svg.join('\n'));
execSync(`python3 -c "import cairosvg; cairosvg.svg2png(url='debug_bosslarger_correct.svg', write_to='debug_bosslarger_correct.png', output_width=800, output_height=600)"`);
console.log('Created debug_bosslarger_correct.png');
