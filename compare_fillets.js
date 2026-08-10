const fs = require('fs');
const R = 30;

const W = 800, H = 400;
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="white"/>
<text x="400" y="25" font-size="16" font-weight="bold" text-anchor="middle">Current vs Correct Fillet</text>
`;

// === LEFT: CURRENT (WRONG) ===
// adjLargerL Top: corner=(bLeft, bTopY)
// Current: center in notch (upper-right of corner)
{
  const ox = 100, oy = 60;
  const cornerX = 100, cornerY = 200;
  
  svg += `<g transform="translate(${ox},${oy})">`;
  svg += `<text x="100" y="-5" font-size="13" font-weight="bold" text-anchor="middle" fill="red">CURRENT (Wrong - Convex)</text>`;
  
  // Step line (vertical, going up from corner)
  svg += `<line x1="${cornerX}" y1="${cornerY-100}" x2="${cornerX}" y2="${cornerY-R}" stroke="black" stroke-width="2"/>`;
  // Boss top line (horizontal, going right from corner)
  svg += `<line x1="${cornerX+R}" y1="${cornerY}" x2="${cornerX+120}" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
  
  // Current arc: center in notch at (cornerX+R, cornerY-R)
  const cx = cornerX+R, cy = cornerY-R;
  svg += `<path d="M ${cornerX} ${cornerY-R} A ${R} ${R} 0 0 1 ${cornerX+R} ${cornerY}" stroke="red" stroke-width="3" fill="none"/>`;
  
  // Show the dashed circle
  svg += `<circle cx="${cx}" cy="${cy}" r="${R}" stroke="#ccc" stroke-width="0.5" fill="none" stroke-dasharray="3,3"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="blue"/>`;
  svg += `<text x="${cx+5}" y="${cy-5}" font-size="9" fill="blue">center (notch)</text>`;
  
  // Corner marker
  svg += `<circle cx="${cornerX}" cy="${cornerY}" r="3" fill="green"/>`;
  svg += `<text x="${cornerX-60}" y="${cornerY+5}" font-size="9" fill="green">corner</text>`;
  
  // Show the notch area
  svg += `<rect x="${cornerX}" y="${cornerY-70}" width="70" height="70" fill="rgba(255,200,200,0.3)" stroke="none"/>`;
  svg += `<text x="${cornerX+10}" y="${cornerY-40}" font-size="8" fill="red">notch/empty</text>`;
  
  // Show material area 
  svg += `<rect x="${cornerX}" y="${cornerY}" width="70" height="50" fill="rgba(200,200,255,0.3)" stroke="none"/>`;
  svg += `<text x="${cornerX+5}" y="${cornerY+20}" font-size="8" fill="blue">material</text>`;
  
  // Arrow showing arc direction (bulges INTO notch - WRONG)
  svg += `<text x="${cornerX+15}" y="${cornerY-55}" font-size="10" fill="red">Arc bulges outward!</text>`;
  
  svg += `</g>`;
}

// === RIGHT: CORRECT (CONCAVE) ===
{
  const ox = 450, oy = 60;
  const cornerX = 100, cornerY = 200;
  
  svg += `<g transform="translate(${ox},${oy})">`;
  svg += `<text x="100" y="-5" font-size="13" font-weight="bold" text-anchor="middle" fill="green">CORRECT (Concave - 오목)</text>`;
  
  // Step line (vertical, going up from corner) - shortened at R BELOW corner
  svg += `<line x1="${cornerX}" y1="${cornerY-100}" x2="${cornerX}" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
  // Boss top line (horizontal, going right from corner) - shortened at R RIGHT of corner
  svg += `<line x1="${cornerX}" y1="${cornerY}" x2="${cornerX+120}" y2="${cornerY}" stroke="black" stroke-width="2"/>`;
  
  // Additional line segments extending INTO material for the fillet
  // The fillet starts R below the corner on the left line (inside boss)
  // and R right of corner on the top line
  
  // Correct arc: center INSIDE the material at (cornerX+R, cornerY+R)
  const cx = cornerX+R, cy = cornerY+R;
  // Start: R below bTopY on the step line extension → (cornerX, cornerY+R) 
  // End: R right of bLeft on boss top → (cornerX+R, cornerY)
  // Arc from start to end, sweep=0 (CCW in SVG Y-down)
  svg += `<path d="M ${cornerX} ${cornerY+R} A ${R} ${R} 0 0 0 ${cornerX+R} ${cornerY}" stroke="green" stroke-width="3" fill="none"/>`;
  
  // Show the dashed circle
  svg += `<circle cx="${cx}" cy="${cy}" r="${R}" stroke="#ccc" stroke-width="0.5" fill="none" stroke-dasharray="3,3"/>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="blue"/>`;
  svg += `<text x="${cx+5}" y="${cy+15}" font-size="9" fill="blue">center (material)</text>`;
  
  // Corner marker
  svg += `<circle cx="${cornerX}" cy="${cornerY}" r="3" fill="green"/>`;
  svg += `<text x="${cornerX-60}" y="${cornerY+5}" font-size="9" fill="green">corner</text>`;
  
  // Show the notch area
  svg += `<rect x="${cornerX}" y="${cornerY-70}" width="70" height="70" fill="rgba(255,200,200,0.3)" stroke="none"/>`;
  svg += `<text x="${cornerX+10}" y="${cornerY-40}" font-size="8" fill="red">notch/empty</text>`;
  
  // Show material area 
  svg += `<rect x="${cornerX}" y="${cornerY}" width="70" height="50" fill="rgba(200,200,255,0.3)" stroke="none"/>`;
  svg += `<text x="${cornerX+5}" y="${cornerY+35}" font-size="8" fill="blue">material (boss)</text>`;
  
  // Arrow showing arc direction
  svg += `<text x="${cornerX+5}" y="${cornerY+55}" font-size="10" fill="green">Arc curves inward!</text>`;
  
  svg += `</g>`;
}

// Add explanation
svg += `<text x="200" y="330" font-size="11" text-anchor="middle">Center in empty notch space</text>`;
svg += `<text x="200" y="345" font-size="11" text-anchor="middle">= arc bulges INTO notch (convex bump)</text>`;
svg += `<text x="550" y="330" font-size="11" text-anchor="middle">Center inside boss material</text>`;
svg += `<text x="550" y="345" font-size="11" text-anchor="middle">= arc curves INTO material (concave fillet)</text>`;
svg += `<text x="400" y="380" font-size="12" text-anchor="middle" fill="#666">The user's reference image shows the CONCAVE type (right side)</text>`;

svg += '</svg>';

fs.writeFileSync('compare_fillets.svg', svg);

const { execSync } = require('child_process');
execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'compare_fillets.svg\', write_to=\'compare_fillets.png\', dpi=150)"', {cwd: '/home/user/webapp'});
console.log('Created compare_fillets.png');
