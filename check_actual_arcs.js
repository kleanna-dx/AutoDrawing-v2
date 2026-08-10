const fs = require('fs');

// The actual arc from the SVG:
// M 342.5 315.3 A 8.0 8.0 0 0 1 350.5 323.3
// start=(342.5, 315.3), end=(350.5, 323.3), R=8, sweep=1

// This means:
// start is at UPPER-LEFT (smaller x, smaller y)
// end is at LOWER-RIGHT (larger x, larger y)

// For a quarter-circle from upper-left to lower-right with sweep=1:
// SVG CW means: the arc curves such that if you stand at start looking toward end,
// the arc curves to your RIGHT

// From (342.5, 315.3) looking toward (350.5, 323.3) = looking DOWN-RIGHT
// Right side = looking toward upper-right (away from corner)
// So sweep=1 here curves the arc toward upper-right

// That means the arc BULGES into the notch (upper-right)!
// This is exactly what the zoomed image showed - convex bump

// To make it curve toward the corner (lower-left), we need sweep=0!

// Let me generate a test with R=50 to clearly see the difference
const R = 50;
const W = 900, H = 400;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="white"/>
<text x="450" y="25" font-size="16" font-weight="bold" text-anchor="middle">adjLargerL Top: Which sweep matches user's hand drawing?</text>
`;

// Profile:
//   adjTopY ──────┐
//                  │ step
//   bTopY  ───────┘ corner = (bLeft, bTopY)
//          boss →
//
// Tangent points:
//   On step (vertical): (bLeft, bTopY - R) ← R units ABOVE corner
//   On boss top (horiz): (bLeft + R, bTopY) ← R units RIGHT of corner

const bLeft = 100, bTopY = 250;

// LEFT: Current code (sweep=1)
svg += `<g transform="translate(50, 50)">`;
svg += `<text x="150" y="0" font-size="13" font-weight="bold" text-anchor="middle">Current: sweep=1</text>`;
svg += `<line x1="${bLeft}" y1="20" x2="${bLeft}" y2="${bTopY}" stroke="black" stroke-width="2"/>`;
svg += `<line x1="${bLeft}" y1="${bTopY}" x2="350" y2="${bTopY}" stroke="black" stroke-width="2"/>`;
// Arc: start=(bLeft, bTopY-R), end=(bLeft+R, bTopY), sweep=1
svg += `<path d="M ${bLeft} ${bTopY-R} A ${R} ${R} 0 0 1 ${bLeft+R} ${bTopY}" stroke="red" stroke-width="3" fill="none"/>`;
svg += `<circle cx="${bLeft}" cy="${bTopY}" r="4" fill="green"/>`;
svg += `<text x="${bLeft-50}" y="${bTopY+15}" font-size="10" fill="green">corner</text>`;
svg += `<circle cx="${bLeft}" cy="${bTopY-R}" r="3" fill="orange"/>`;
svg += `<text x="${bLeft-30}" y="${bTopY-R-5}" font-size="9" fill="orange">S</text>`;
svg += `<circle cx="${bLeft+R}" cy="${bTopY}" r="3" fill="purple"/>`;
svg += `<text x="${bLeft+R+5}" y="${bTopY+15}" font-size="9" fill="purple">E</text>`;
svg += `</g>`;

// MIDDLE: sweep=0
svg += `<g transform="translate(350, 50)">`;
svg += `<text x="150" y="0" font-size="13" font-weight="bold" text-anchor="middle" fill="green">Fix: sweep=0</text>`;
svg += `<line x1="${bLeft}" y1="20" x2="${bLeft}" y2="${bTopY}" stroke="black" stroke-width="2"/>`;
svg += `<line x1="${bLeft}" y1="${bTopY}" x2="350" y2="${bTopY}" stroke="black" stroke-width="2"/>`;
// Arc: start=(bLeft, bTopY-R), end=(bLeft+R, bTopY), sweep=0
svg += `<path d="M ${bLeft} ${bTopY-R} A ${R} ${R} 0 0 0 ${bLeft+R} ${bTopY}" stroke="green" stroke-width="3" fill="none"/>`;
svg += `<circle cx="${bLeft}" cy="${bTopY}" r="4" fill="green"/>`;
svg += `<text x="${bLeft-50}" y="${bTopY+15}" font-size="10" fill="green">corner</text>`;
svg += `<circle cx="${bLeft}" cy="${bTopY-R}" r="3" fill="orange"/>`;
svg += `<circle cx="${bLeft+R}" cy="${bTopY}" r="3" fill="purple"/>`;
svg += `</g>`;

svg += `<text x="450" y="360" font-size="14" font-weight="bold" text-anchor="middle" fill="green">sweep=0 curves TOWARD corner = concave fillet (오목) = CORRECT</text>`;
svg += `<text x="450" y="380" font-size="14" font-weight="bold" text-anchor="middle" fill="red">sweep=1 curves AWAY from corner = convex bump = WRONG</text>`;

svg += '</svg>';

fs.writeFileSync('sweep_fix_test.svg', svg);
const { execSync } = require('child_process');
execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'sweep_fix_test.svg\', write_to=\'sweep_fix_test.png\', dpi=150)"', {cwd: '/home/user/webapp'});
console.log('Created sweep_fix_test.png');
