const fs = require('fs');
const { execSync } = require('child_process');

const W = 700, H = 450;
const R = 20;

let svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
svg.push(`<rect width="${W}" height="${H}" fill="white"/>`);
svg.push(`<text x="${W/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold">Final: All Concave Fillets Correct</text>`);

// ===== LEFT: adjLarger (gear > boss) =====
// Full profile with top and bottom fillets
{
  const cx = 170; // step x
  const gTopY = 70, gBotY = 360;
  const bTopY = 130, bBotY = 300;
  
  svg.push(`<text x="120" y="55" text-anchor="middle" font-size="11" fill="#666">adjLarger (sweep=0)</text>`);
  
  // Gear outlines
  svg.push(`<line x1="50" y1="${gTopY}" x2="${cx}" y2="${gTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="50" y1="${gBotY}" x2="${cx}" y2="${gBotY}" stroke="black" stroke-width="2"/>`);
  
  // Step verticals (shortened by R)
  svg.push(`<line x1="${cx}" y1="${gTopY}" x2="${cx}" y2="${bTopY-R}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${cx}" y1="${bBotY+R}" x2="${cx}" y2="${gBotY}" stroke="black" stroke-width="2"/>`);
  
  // Boss horizontals (start at tangent point)
  svg.push(`<line x1="${cx+R}" y1="${bTopY}" x2="290" y2="${bTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${cx+R}" y1="${bBotY}" x2="290" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  
  // Top fillet: sweep=0
  svg.push(`<path d="M ${cx} ${bTopY-R} A ${R} ${R} 0 0 0 ${cx+R} ${bTopY}" fill="none" stroke="red" stroke-width="2.5"/>`);
  // Bottom fillet: sweep=0
  svg.push(`<path d="M ${cx+R} ${bBotY} A ${R} ${R} 0 0 0 ${cx} ${bBotY+R}" fill="none" stroke="red" stroke-width="2.5"/>`);
  
  // Corner dots
  svg.push(`<circle cx="${cx}" cy="${bTopY}" r="3" fill="green"/>`);
  svg.push(`<circle cx="${cx}" cy="${bBotY}" r="3" fill="green"/>`);
  
  // Labels
  svg.push(`<text x="${cx+R+5}" y="${bTopY-5}" font-size="10" fill="red">R</text>`);
  svg.push(`<text x="${cx+R+5}" y="${bBotY+12}" font-size="10" fill="red">R</text>`);
  svg.push(`<text x="90" y="${(gTopY+bTopY)/2+4}" font-size="9" fill="#aaa">gear</text>`);
  svg.push(`<text x="230" y="${(bTopY+bBotY)/2+4}" font-size="9" fill="#aaa">boss</text>`);
}

// ===== RIGHT: bossLarger (boss > gear) =====
{
  const cx = 500; // step x
  const bTopY = 70, bBotY = 360;
  const aTopY = 130, aBotY = 300;
  
  svg.push(`<text x="500" y="55" text-anchor="middle" font-size="11" fill="#666">bossLarger (sweep=1)</text>`);
  
  // Boss outlines
  svg.push(`<line x1="380" y1="${bTopY}" x2="${cx}" y2="${bTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="380" y1="${bBotY}" x2="${cx}" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  
  // Step verticals (shortened by R)
  svg.push(`<line x1="${cx}" y1="${bTopY}" x2="${cx}" y2="${aTopY-R}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${cx}" y1="${aBotY+R}" x2="${cx}" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  
  // Adj horizontals (going right from tangent point)
  svg.push(`<line x1="${cx-R}" y1="${aTopY}" x2="380" y2="${aTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${cx-R}" y1="${aBotY}" x2="380" y2="${aBotY}" stroke="black" stroke-width="2"/>`);
  // ... continuing right
  svg.push(`<line x1="${cx-R}" y1="${aTopY}" x2="${cx-R-0.01}" y2="${aTopY}" stroke="black" stroke-width="0"/>`)
  // Actually adj goes LEFT from corner for bossLargerL
  // Let me redo: for bossLargerL, adj extends to the LEFT, boss extends to the RIGHT
  // Wait, I need to match the user's reference image exactly.
  // In the user's image (right side):
  //   Boss horizontal on top, step going down, then adj horizontal going right
  // So adj goes RIGHT from the step.
  
  // Let me redo right side to match user's reference layout
}

svg.push(`</svg>`);

// Actually let me just create a clean side-by-side that matches user's reference exactly
svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
svg.push(`<rect width="${W}" height="${H}" fill="white"/>`);
svg.push(`<text x="${W/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold">Final Verification: Concave Fillets</text>`);

// LEFT: adjLarger - gear(larger) left, boss(smaller) right
{
  const stepX = 170;
  const gTopY = 80, gBotY = 350;
  const bTopY = 140, bBotY = 290;
  
  svg.push(`<text x="170" y="55" text-anchor="middle" font-size="11" fill="#666">adjLarger: Gear → Boss (sweep=0)</text>`);
  
  // Gear sides
  svg.push(`<line x1="50" y1="${gTopY}" x2="${stepX}" y2="${gTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="50" y1="${gBotY}" x2="${stepX}" y2="${gBotY}" stroke="black" stroke-width="2"/>`);
  // Step verticals
  svg.push(`<line x1="${stepX}" y1="${gTopY}" x2="${stepX}" y2="${bTopY-R}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX}" y1="${bBotY+R}" x2="${stepX}" y2="${gBotY}" stroke="black" stroke-width="2"/>`);
  // Boss sides
  svg.push(`<line x1="${stepX+R}" y1="${bTopY}" x2="300" y2="${bTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX+R}" y1="${bBotY}" x2="300" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="300" y1="${bTopY}" x2="300" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  
  // Top fillet sweep=0
  svg.push(`<path d="M ${stepX} ${bTopY-R} A ${R} ${R} 0 0 0 ${stepX+R} ${bTopY}" fill="none" stroke="red" stroke-width="2.5"/>`);
  // Bot fillet sweep=0
  svg.push(`<path d="M ${stepX+R} ${bBotY} A ${R} ${R} 0 0 0 ${stepX} ${bBotY+R}" fill="none" stroke="red" stroke-width="2.5"/>`);
  
  svg.push(`<circle cx="${stepX}" cy="${bTopY}" r="2.5" fill="green"/>`);
  svg.push(`<circle cx="${stepX}" cy="${bBotY}" r="2.5" fill="green"/>`);
  svg.push(`<text x="${stepX+R+3}" y="${bTopY-3}" font-size="10" fill="red">R${R}</text>`);
  svg.push(`<text x="${stepX+R+3}" y="${bBotY+12}" font-size="10" fill="red">R${R}</text>`);
  svg.push(`<text x="100" y="${(gTopY+bTopY)/2+4}" font-size="9" fill="#aaa">gear</text>`);
  svg.push(`<text x="250" y="${(bTopY+bBotY)/2+4}" font-size="9" fill="#aaa">boss</text>`);
}

// RIGHT: bossLarger - boss(larger) left, adj(smaller) right
{
  const stepX = 500;
  const bTopY = 80, bBotY = 350;
  const aTopY = 140, aBotY = 290;
  
  svg.push(`<text x="500" y="55" text-anchor="middle" font-size="11" fill="#666">bossLarger: Boss → Adj (sweep=1)</text>`);
  
  // Boss sides
  svg.push(`<line x1="380" y1="${bTopY}" x2="${stepX}" y2="${bTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="380" y1="${bBotY}" x2="${stepX}" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="380" y1="${bTopY}" x2="380" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  // Step verticals
  svg.push(`<line x1="${stepX}" y1="${bTopY}" x2="${stepX}" y2="${aTopY-R}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX}" y1="${aBotY+R}" x2="${stepX}" y2="${bBotY}" stroke="black" stroke-width="2"/>`);
  // Adj sides
  svg.push(`<line x1="${stepX-R}" y1="${aTopY}" x2="380" y2="${aTopY}" stroke="black" stroke-width="0.5" stroke-dasharray="4,2"/>`);
  // Adj goes RIGHT from step
  svg.push(`<line x1="${stepX-R}" y1="${aTopY}" x2="650" y2="${aTopY}" stroke="black" stroke-width="2"/>`);
  svg.push(`<line x1="${stepX-R}" y1="${aBotY}" x2="650" y2="${aBotY}" stroke="black" stroke-width="2"/>`);
  
  // Top fillet: center in notch=(stepX-R, aTopY-R)... wait
  // For bossLargerL: center=(bLeft-R, adjTopY-R)
  // Here bLeft=stepX, so center=(stepX-R, aTopY-R)
  // start=(stepX-R, aTopY), end=(stepX, aTopY-R), sweep=1
  // But the adj line goes LEFT from corner here... 
  // Actually in this visual, the adj goes RIGHT. Let me match to bossLargerR instead:
  // bossLargerR: center=(bRight+R, adjTopY-R)
  // Here bRight=stepX, center=(stepX+R, aTopY-R)
  // start=(stepX, aTopY-R), end=(stepX+R, aTopY), sweep=1
  
  // Hmm, let me just use the actual geometry:
  // Step is at x=stepX. Boss is to the LEFT. Adj is to the RIGHT.
  // Corner top = (stepX, aTopY)
  // Vertical goes UP from aTopY. Adj horizontal goes RIGHT from stepX.
  // Notch is to the RIGHT and UP.
  // This matches bossLargerR.
  // center=(stepX+R, aTopY-R), start=(stepX, aTopY-R), end=(stepX+R, aTopY), sweep=1
  
  svg.push(`<path d="M ${stepX} ${aTopY-R} A ${R} ${R} 0 0 1 ${stepX+R} ${aTopY}" fill="none" stroke="red" stroke-width="2.5"/>`);
  // Bot: center=(stepX+R, aBotY+R), start=(stepX+R, aBotY), end=(stepX, aBotY+R), sweep=1
  svg.push(`<path d="M ${stepX+R} ${aBotY} A ${R} ${R} 0 0 1 ${stepX} ${aBotY+R}" fill="none" stroke="red" stroke-width="2.5"/>`);

  // Actually wait - for bossLargerR the code is:
  // start=(bRight, adjTopY-rPx) end=(bRight+rPx, adjTopY) sweep=1
  // That IS (stepX, aTopY-R) → (stepX+R, aTopY) sweep=1 ✓
  
  // And bot: start=(bRight+rPx, adjBotY) end=(bRight, adjBotY+rPx) sweep=1
  // That IS (stepX+R, aBotY) → (stepX, aBotY+R) sweep=1 ✓
  
  svg.push(`<circle cx="${stepX}" cy="${aTopY}" r="2.5" fill="green"/>`);
  svg.push(`<circle cx="${stepX}" cy="${aBotY}" r="2.5" fill="green"/>`);
  svg.push(`<text x="${stepX+R+3}" y="${aTopY-3}" font-size="10" fill="red">R${R}</text>`);
  svg.push(`<text x="${stepX+R+3}" y="${aBotY+12}" font-size="10" fill="red">R${R}</text>`);
  svg.push(`<text x="430" y="${(bTopY+aTopY)/2+4}" font-size="9" fill="#aaa">boss</text>`);
  svg.push(`<text x="580" y="${(aTopY+aBotY)/2+4}" font-size="9" fill="#aaa">adj</text>`);
}

svg.push(`<text x="${W/2}" y="${H-15}" text-anchor="middle" font-size="11" fill="#333">Both adjLarger and bossLarger fillets now curve TOWARD the corner (concave)</text>`);
svg.push(`</svg>`);

fs.writeFileSync('final_verify.svg', svg.join('\n'));
execSync(`python3 -c "import cairosvg; cairosvg.svg2png(url='final_verify.svg', write_to='final_verify.png', output_width=700, output_height=450)"`);
console.log('Created final_verify.png');
