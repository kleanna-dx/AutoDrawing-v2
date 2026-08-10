const fs = require('fs');

// Test what sweep=0 and sweep=1 actually look like in SVG
// For a 90° fillet at corner (100, 200) with R=50
const R = 50;
const cornerX = 100, cornerY = 200;

// Tangent points (same for both):
// On vertical line: (cornerX, cornerY - R) = (100, 150)  
// On horizontal line: (cornerX + R, cornerY) = (150, 200)
// Center in notch: (cornerX + R, cornerY - R) = (150, 150)

const sx = cornerX;       // 100
const sy = cornerY - R;   // 150
const ex = cornerX + R;   // 150
const ey = cornerY;       // 200

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
<rect width="800" height="500" fill="white"/>
<text x="400" y="30" font-size="18" font-weight="bold" text-anchor="middle">SVG Arc Sweep Direction Test</text>
`;

// LEFT: sweep=0
svg += `<g transform="translate(50, 50)">`;
svg += `<text x="150" y="30" font-size="14" font-weight="bold" text-anchor="middle">sweep=0 (CCW)</text>`;
// Lines
svg += `<line x1="${cornerX}" y1="50" x2="${cornerX}" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
svg += `<line x1="${cornerX}" y1="${cornerY}" x2="300" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
// Arc with sweep=0
svg += `<path d="M ${sx} ${sy} A ${R} ${R} 0 0 0 ${ex} ${ey}" stroke="red" stroke-width="3" fill="none"/>`;
// Center
svg += `<circle cx="${cornerX+R}" cy="${cornerY-R}" r="3" fill="blue"/>`;
svg += `<text x="${cornerX+R+5}" y="${cornerY-R-5}" font-size="10" fill="blue">center</text>`;
// Corner
svg += `<circle cx="${cornerX}" cy="${cornerY}" r="4" fill="green"/>`;
svg += `<text x="${cornerX-50}" y="${cornerY+15}" font-size="10" fill="green">corner</text>`;
// Tangent points
svg += `<circle cx="${sx}" cy="${sy}" r="3" fill="orange"/>`;
svg += `<circle cx="${ex}" cy="${ey}" r="3" fill="orange"/>`;
svg += `</g>`;

// RIGHT: sweep=1
svg += `<g transform="translate(400, 50)">`;
svg += `<text x="150" y="30" font-size="14" font-weight="bold" text-anchor="middle">sweep=1 (CW)</text>`;
// Lines
svg += `<line x1="${cornerX}" y1="50" x2="${cornerX}" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
svg += `<line x1="${cornerX}" y1="${cornerY}" x2="300" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
// Arc with sweep=1
svg += `<path d="M ${sx} ${sy} A ${R} ${R} 0 0 1 ${ex} ${ey}" stroke="red" stroke-width="3" fill="none"/>`;
// Center
svg += `<circle cx="${cornerX+R}" cy="${cornerY-R}" r="3" fill="blue"/>`;
svg += `<text x="${cornerX+R+5}" y="${cornerY-R-5}" font-size="10" fill="blue">center</text>`;
// Corner
svg += `<circle cx="${cornerX}" cy="${cornerY}" r="4" fill="green"/>`;
svg += `<text x="${cornerX-50}" y="${cornerY+15}" font-size="10" fill="green">corner</text>`;
// Tangent points
svg += `<circle cx="${sx}" cy="${sy}" r="3" fill="orange"/>`;
svg += `<circle cx="${ex}" cy="${ey}" r="3" fill="orange"/>`;
svg += `</g>`;

// EXPLANATION
svg += `<text x="400" y="330" font-size="13" text-anchor="middle">Same start (100,150) and end (150,200), same radius R=50</text>`;
svg += `<text x="400" y="350" font-size="13" text-anchor="middle">sweep=0: arc goes AWAY from corner (convex bump into notch)</text>`;
svg += `<text x="400" y="370" font-size="13" text-anchor="middle">sweep=1: arc goes TOWARD corner (concave, hugs corner)</text>`;
svg += `<text x="400" y="400" font-size="14" font-weight="bold" text-anchor="middle" fill="green">User wants: sweep=1 → concave fillet toward corner</text>`;

// BOTTOM: Also test with large-arc-flag=1
svg += `<text x="200" y="440" font-size="11" text-anchor="middle" fill="#666">Note: large-arc-flag=0 means minor arc (quarter circle)</text>`;
svg += `<text x="200" y="455" font-size="11" text-anchor="middle" fill="#666">large-arc-flag=1 would be the major arc (three-quarter circle)</text>`;

svg += '</svg>';

fs.writeFileSync('test_sweep_direction.svg', svg);

const { execSync } = require('child_process');
execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'test_sweep_direction.svg\', write_to=\'test_sweep_direction.png\', dpi=150)"', {cwd: '/home/user/webapp'});
console.log('Created test_sweep_direction.png');
