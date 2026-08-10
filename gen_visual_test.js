// Generate a clear visual test SVG showing all 8 fillet cases
// with large R values so the arcs are clearly visible

const W = 1200, H = 600;
const R = 30; // fillet radius (large for visibility)

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>
  text { font-family: sans-serif; font-size: 11px; }
  .title { font-size: 14px; font-weight: bold; }
  .label { font-size: 10px; fill: #666; }
</style>
<rect width="${W}" height="${H}" fill="white"/>
`;

function drawCase(x, y, name, bLeft, bRight, bTopY, bBotY, adjTopY, adjBotY, isLeft, isAdjLarger) {
  let s = `<g transform="translate(${x},${y})">`;
  s += `<text x="75" y="-10" text-anchor="middle" class="title">${name}</text>`;
  
  // Draw the profile with step
  const stepX = isLeft ? bLeft : bRight;
  
  if (isAdjLarger) {
    // Adjacent is larger: step at boss edge
    // Adjacent extends beyond boss
    if (isLeft) {
      // Vertical step on left of boss
      s += `<line x1="${bLeft}" y1="${adjTopY}" x2="${bLeft}" y2="${bTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bBotY}" x2="${bLeft}" y2="${adjBotY}" stroke="#999" stroke-width="1.5"/>`;
      // Boss horizontal lines
      s += `<line x1="${bLeft}" y1="${bTopY}" x2="${bRight}" y2="${bTopY}" stroke="black" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bBotY}" x2="${bRight}" y2="${bBotY}" stroke="black" stroke-width="1.5"/>`;
      // Adjacent horizontal lines
      s += `<line x1="${bLeft-50}" y1="${adjTopY}" x2="${bLeft}" y2="${adjTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft-50}" y1="${adjBotY}" x2="${bLeft}" y2="${adjBotY}" stroke="#999" stroke-width="1.5"/>`;
    } else {
      // Vertical step on right of boss
      s += `<line x1="${bRight}" y1="${adjTopY}" x2="${bRight}" y2="${bTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bRight}" y1="${bBotY}" x2="${bRight}" y2="${adjBotY}" stroke="#999" stroke-width="1.5"/>`;
      // Boss horizontal lines
      s += `<line x1="${bLeft}" y1="${bTopY}" x2="${bRight}" y2="${bTopY}" stroke="black" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bBotY}" x2="${bRight}" y2="${bBotY}" stroke="black" stroke-width="1.5"/>`;
      // Adjacent horizontal lines
      s += `<line x1="${bRight}" y1="${adjTopY}" x2="${bRight+50}" y2="${adjTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bRight}" y1="${adjBotY}" x2="${bRight+50}" y2="${adjBotY}" stroke="#999" stroke-width="1.5"/>`;
    }
  } else {
    // Boss is larger: step at adj boundary
    if (isLeft) {
      s += `<line x1="${bLeft}" y1="${bTopY}" x2="${bLeft}" y2="${adjTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${adjBotY}" x2="${bLeft}" y2="${bBotY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bTopY}" x2="${bRight}" y2="${bTopY}" stroke="black" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bBotY}" x2="${bRight}" y2="${bBotY}" stroke="black" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft-50}" y1="${adjTopY}" x2="${bLeft}" y2="${adjTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft-50}" y1="${adjBotY}" x2="${bLeft}" y2="${adjBodY}" stroke="#999" stroke-width="1.5"/>`;
    } else {
      s += `<line x1="${bRight}" y1="${bTopY}" x2="${bRight}" y2="${adjTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bRight}" y1="${adjBodY}" x2="${bRight}" y2="${bBotY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bTopY}" x2="${bRight}" y2="${bTopY}" stroke="black" stroke-width="1.5"/>`;
      s += `<line x1="${bLeft}" y1="${bBotY}" x2="${bRight}" y2="${bBotY}" stroke="black" stroke-width="1.5"/>`;
      s += `<line x1="${bRight}" y1="${adjTopY}" x2="${bRight+50}" y2="${adjTopY}" stroke="#999" stroke-width="1.5"/>`;
      s += `<line x1="${bRight}" y1="${adjBodY}" x2="${bRight+50}" y2="${adjBodY}" stroke="#999" stroke-width="1.5"/>`;
    }
  }
  
  // Draw the fillet arcs using the exact same logic as ai-engine.js
  if (isLeft) {
    if (isAdjLarger) {
      // adjLargerL Top: center=(bLeft+R, bTopY-R), start=(bLeft, bTopY-R), end=(bLeft+R, bTopY), sweep=1
      const cx1 = bLeft+R, cy1 = bTopY-R;
      s += `<path d="M ${bLeft} ${bTopY-R} A ${R} ${R} 0 0 1 ${bLeft+R} ${bTopY}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx1}" cy="${cy1}" r="2" fill="blue"/>`;
      s += `<text x="${cx1+3}" y="${cy1-3}" class="label">C</text>`;
      // adjLargerL Bot: center=(bLeft+R, bBotY+R), start=(bLeft+R, bBotY), end=(bLeft, bBotY+R), sweep=1
      const cx2 = bLeft+R, cy2 = bBotY+R;
      s += `<path d="M ${bLeft+R} ${bBotY} A ${R} ${R} 0 0 1 ${bLeft} ${bBotY+R}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx2}" cy="${cy2}" r="2" fill="blue"/>`;
    } else {
      // bossLargerL Top: center=(bLeft-R, adjTopY-R), start=(bLeft-R, adjTopY), end=(bLeft, adjTopY-R), sweep=1
      const cx1 = bLeft-R, cy1 = adjTopY-R;
      s += `<path d="M ${bLeft-R} ${adjTopY} A ${R} ${R} 0 0 1 ${bLeft} ${adjTopY-R}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx1}" cy="${cy1}" r="2" fill="blue"/>`;
      s += `<text x="${cx1+3}" y="${cy1-3}" class="label">C</text>`;
      // bossLargerL Bot: center=(bLeft-R, adjBotY+R), start=(bLeft, adjBotY+R), end=(bLeft-R, adjBotY), sweep=1
      const cx2 = bLeft-R, cy2 = adjBotY+R;
      s += `<path d="M ${bLeft} ${adjBotY+R} A ${R} ${R} 0 0 1 ${bLeft-R} ${adjBotY}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx2}" cy="${cy2}" r="2" fill="blue"/>`;
    }
  } else {
    if (isAdjLarger) {
      // adjLargerR Top: center=(bRight-R, bTopY-R), start=(bRight-R, bTopY), end=(bRight, bTopY-R), sweep=1
      const cx1 = bRight-R, cy1 = bTopY-R;
      s += `<path d="M ${bRight-R} ${bTopY} A ${R} ${R} 0 0 1 ${bRight} ${bTopY-R}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx1}" cy="${cy1}" r="2" fill="blue"/>`;
      s += `<text x="${cx1+3}" y="${cy1-3}" class="label">C</text>`;
      // adjLargerR Bot: center=(bRight-R, bBotY+R), start=(bRight, bBotY+R), end=(bRight-R, bBotY), sweep=1
      const cx2 = bRight-R, cy2 = bBotY+R;
      s += `<path d="M ${bRight} ${bBotY+R} A ${R} ${R} 0 0 1 ${bRight-R} ${bBotY}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx2}" cy="${cy2}" r="2" fill="blue"/>`;
    } else {
      // bossLargerR Top: center=(bRight+R, adjTopY-R), start=(bRight, adjTopY-R), end=(bRight+R, adjTopY), sweep=1
      const cx1 = bRight+R, cy1 = adjTopY-R;
      s += `<path d="M ${bRight} ${adjTopY-R} A ${R} ${R} 0 0 1 ${bRight+R} ${adjTopY}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx1}" cy="${cy1}" r="2" fill="blue"/>`;
      s += `<text x="${cx1+3}" y="${cy1-3}" class="label">C</text>`;
      // bossLargerR Bot: center=(bRight+R, adjBotY+R), start=(bRight+R, adjBotY), end=(bRight, adjBotY+R), sweep=1
      const cx2 = bRight+R, cy2 = adjBotY+R;
      s += `<path d="M ${bRight+R} ${adjBotY} A ${R} ${R} 0 0 1 ${bRight} ${adjBotY+R}" stroke="red" stroke-width="2" fill="none"/>`;
      s += `<circle cx="${cx2}" cy="${cy2}" r="2" fill="blue"/>`;
    }
  }
  
  // Draw corner marker
  const cornerY_top = isAdjLarger ? bTopY : adjTopY;
  const cornerY_bot = isAdjLarger ? bBotY : adjBotY;
  const cornerX = isLeft ? bLeft : bRight;
  s += `<circle cx="${cornerX}" cy="${cornerY_top}" r="3" fill="green"/>`;
  s += `<text x="${cornerX+4}" y="${cornerY_top-4}" class="label" fill="green">corner</text>`;
  s += `<circle cx="${cornerX}" cy="${cornerY_bot}" r="3" fill="green"/>`;
  
  s += `</g>`;
  return s;
}

// 4 cases: adjLargerL, adjLargerR, bossLargerL, bossLargerR
// Each shows top and bottom fillets

// Case 1-2: adjLargerL
svg += drawCase(20, 30, 'Case 1-2: adjLargerL', 50, 150, 80, 200, 50, 230, true, true);

// Case 3-4: adjLargerR
svg += drawCase(320, 30, 'Case 3-4: adjLargerR', 50, 150, 80, 200, 50, 230, false, true);

// Case 5-6: bossLargerL
svg += drawCase(20, 320, 'Case 5-6: bossLargerL', 50, 150, 50, 230, 80, 200, true, false);

// Case 7-8: bossLargerR
svg += drawCase(320, 320, 'Case 7-8: bossLargerR', 50, 150, 50, 230, 80, 200, false, false);

svg += '</svg>';

require('fs').writeFileSync('test_visual_fillets.svg', svg);
console.log('Created test_visual_fillets.svg');
