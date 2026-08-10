const fs = require('fs');
const { execSync } = require('child_process');

// Realistic boss+gear cross-section with concave fillets
const W = 600, H = 400;
const R = 15; // fillet radius

// Gear is taller, boss is shorter (adjLarger case)
const gearTopY = 80, gearBotY = 320;
const bossTopY = 130, bossBotY = 270;
const stepX = 200; // where gear meets boss

let svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`);
svg.push(`<rect width="${W}" height="${H}" fill="white"/>`);
svg.push(`<text x="${W/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold">Boss Profile with Concave Fillets (sweep=0)</text>`);

// ---- Left side: adjLarger (gear taller than boss) ----
svg.push(`<text x="200" y="55" text-anchor="middle" font-size="12" fill="#666">adjLarger: Gear(larger) → Boss(smaller)</text>`);

// Gear top/bottom horizontal lines
svg.push(`<line x1="100" y1="${gearTopY}" x2="${stepX}" y2="${gearTopY}" stroke="black" stroke-width="2"/>`);
svg.push(`<line x1="100" y1="${gearBotY}" x2="${stepX}" y2="${gearBotY}" stroke="black" stroke-width="2"/>`);

// Step vertical line (top): gearTopY → bossTopY-R
svg.push(`<line x1="${stepX}" y1="${gearTopY}" x2="${stepX}" y2="${bossTopY - R}" stroke="black" stroke-width="2"/>`);
// Step vertical line (bottom): bossBotY+R → gearBotY
svg.push(`<line x1="${stepX}" y1="${bossBotY + R}" x2="${stepX}" y2="${gearBotY}" stroke="black" stroke-width="2"/>`);

// Boss top/bottom horizontal lines
svg.push(`<line x1="${stepX + R}" y1="${bossTopY}" x2="350" y2="${bossTopY}" stroke="black" stroke-width="2"/>`);
svg.push(`<line x1="${stepX + R}" y1="${bossBotY}" x2="350" y2="${bossBotY}" stroke="black" stroke-width="2"/>`);

// Top fillet: corner=(stepX, bossTopY), center=(stepX+R, bossTopY-R)
// start=(stepX, bossTopY-R), end=(stepX+R, bossTopY), sweep=0
svg.push(`<path d="M ${stepX} ${bossTopY - R} A ${R} ${R} 0 0 0 ${stepX + R} ${bossTopY}" fill="none" stroke="red" stroke-width="2.5"/>`);

// Bottom fillet: corner=(stepX, bossBotY), center=(stepX+R, bossBotY+R)
// start=(stepX+R, bossBotY), end=(stepX, bossBotY+R), sweep=0
svg.push(`<path d="M ${stepX + R} ${bossBotY} A ${R} ${R} 0 0 0 ${stepX} ${bossBotY + R}" fill="none" stroke="red" stroke-width="2.5"/>`);

// Corner dots
svg.push(`<circle cx="${stepX}" cy="${bossTopY}" r="3" fill="green"/>`);
svg.push(`<circle cx="${stepX}" cy="${bossBotY}" r="3" fill="green"/>`);

// R annotation
svg.push(`<text x="${stepX+R+5}" y="${bossTopY-R/2}" font-size="11" fill="red">R${R}</text>`);
svg.push(`<text x="${stepX+R+5}" y="${bossBotY+R/2+4}" font-size="11" fill="red">R${R}</text>`);

// ---- Right side: bossLarger (boss taller than gear) ----
const rStepX = 450;
const rGearTopY = 130, rGearBotY = 270;
const rBossTopY = 80, rBossBotY = 320;

svg.push(`<text x="450" y="55" text-anchor="middle" font-size="12" fill="#666">bossLarger: Boss(larger) → Gear(smaller)</text>`);

// Boss top/bottom horizontal lines
svg.push(`<line x1="380" y1="${rBossTopY}" x2="${rStepX}" y2="${rBossTopY}" stroke="black" stroke-width="2"/>`);
svg.push(`<line x1="380" y1="${rBossBotY}" x2="${rStepX}" y2="${rBossBotY}" stroke="black" stroke-width="2"/>`);

// Step vertical line (top): bossTopY → gearTopY-R
svg.push(`<line x1="${rStepX}" y1="${rBossTopY}" x2="${rStepX}" y2="${rGearTopY - R}" stroke="black" stroke-width="2"/>`);
// Step vertical line (bottom): gearBotY+R → bossBotY
svg.push(`<line x1="${rStepX}" y1="${rGearBotY + R}" x2="${rStepX}" y2="${rBossBotY}" stroke="black" stroke-width="2"/>`);

// Gear top/bottom horizontal lines
svg.push(`<line x1="${rStepX - R}" y1="${rGearTopY}" x2="560" y2="${rGearTopY}" stroke="black" stroke-width="2"/>`);
svg.push(`<line x1="${rStepX - R}" y1="${rGearBotY}" x2="560" y2="${rGearBotY}" stroke="black" stroke-width="2"/>`);

// Top fillet: corner=(rStepX, rGearTopY), center=(rStepX-R, rGearTopY-R)  [bossLargerL case mirrored]
// But this is Right side... bossLargerR:
// corner=(rStepX, rGearTopY), center=(rStepX+R, rGearTopY-R)
// start=(rStepX, rGearTopY-R), end=(rStepX+R, rGearTopY), sweep=0
// Wait - for a right-side boss where boss is larger:
// center=(bRight+R, adjTopY-R), start=(bRight, adjTopY-R), end=(bRight+R, adjTopY)
// That's going to the right. But here the adj (gear) is to the right.
// Let me use bossLargerL instead: corner at left edge
// center=(bLeft-R, adjTopY-R), start=(bLeft-R, adjTopY), end=(bLeft, adjTopY-R)

// Actually for this visual, let's do: vertical step on left side of smaller element
// bossLarger on left side:
// corner=(rStepX, rGearTopY), lines going: down from boss, right into gear
// center = in the notch = to the right and up = (rStepX+R, rGearTopY-R)
// NOT matching our code... let me just use the correct formula

// For right-side layout (step at rStepX, gear extends right):
// This is like adjLargerR reversed... actually let me just show a clean L profile
// bossLargerR Top: corner=(bRight, adjTopY)
// center=(bRight+R, adjTopY-R), start=(bRight, adjTopY-R), end=(bRight+R, adjTopY), sweep=0
svg.push(`<path d="M ${rStepX} ${rGearTopY - R} A ${R} ${R} 0 0 0 ${rStepX - R} ${rGearTopY}" fill="none" stroke="red" stroke-width="2.5"/>`);

// Bottom fillet  
svg.push(`<path d="M ${rStepX - R} ${rGearBotY} A ${R} ${R} 0 0 0 ${rStepX} ${rGearBotY + R}" fill="none" stroke="red" stroke-width="2.5"/>`);

// Corner dots
svg.push(`<circle cx="${rStepX}" cy="${rGearTopY}" r="3" fill="green"/>`);
svg.push(`<circle cx="${rStepX}" cy="${rGearBotY}" r="3" fill="green"/>`);

// R annotation
svg.push(`<text x="${rStepX - R - 25}" y="${rGearTopY - R/2}" font-size="11" fill="red">R${R}</text>`);
svg.push(`<text x="${rStepX - R - 25}" y="${rGearBotY + R/2 + 4}" font-size="11" fill="red">R${R}</text>`);

// Labels
svg.push(`<text x="150" y="${(gearTopY+bossTopY)/2+4}" font-size="10" fill="#888">gear</text>`);
svg.push(`<text x="270" y="${(bossTopY+bossBotY)/2+4}" font-size="10" fill="#888">boss</text>`);
svg.push(`<text x="400" y="${(rBossTopY+rGearTopY)/2+4}" font-size="10" fill="#888">boss</text>`);
svg.push(`<text x="500" y="${(rGearTopY+rGearBotY)/2+4}" font-size="10" fill="#888">gear</text>`);

svg.push(`<text x="${W/2}" y="${H-15}" text-anchor="middle" font-size="11" fill="#333">Concave fillets (sweep=0): arcs curve toward the corner, smoothing the inner edge</text>`);

svg.push(`</svg>`);

fs.writeFileSync('verify_boss_profile.svg', svg.join('\n'));
execSync('python3 -c "import cairosvg; cairosvg.svg2png(url=\'verify_boss_profile.svg\', write_to=\'verify_boss_profile.png\', output_width=600, output_height=400)"');
console.log('Created verify_boss_profile.png');
