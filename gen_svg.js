const fs = require("fs");

// Mock browser APIs
global.document = { getElementById: () => null, createElement: () => ({}) };
global.window = {};
global.console = console;

// Load modules
const dmSrc = fs.readFileSync("js/drawing-model.js", "utf8");
const aeSrc = fs.readFileSync("js/ai-engine.js", "utf8");

// Modify to capture the IIFE results
const dmMod = dmSrc.replace("const DrawingModel = (() => {", "global.DrawingModel = (() => {");
const aeMod = aeSrc.replace("const AIEngine = (() => {", "global.AIEngine = (() => {");

eval(dmMod);
eval(aeMod);

const demoSpec = JSON.parse(JSON.stringify(global.AIEngine.DEMO_SHAFT_SPEC));
demoSpec.geometrySpec.chainGears = [{
  id: "CG1", section: "S1", side: "left",
  chainSpec: "RS35", teeth: 9, outerDiam: 31, boreDiam: 0, gearWidth: 8,
  boss: { count: 2, bosses: [
    { outerDiam: 22, thickness: 5, fillet: { value: 2, side: "both" } },
    { outerDiam: 18, thickness: 4, fillet: { value: 1.5, side: "both" } }
  ]},
  confidence: "confirmed"
}];
demoSpec.chainGears = demoSpec.geometrySpec.chainGears;

const result = global.AIEngine.generateFromCustomSpec(demoSpec);

// Collect and verify arcs
const arcs = result.elements.filter(el => el._arc && el._arc.r > 0);
console.log(`\n=== ARC VERIFICATION (${arcs.length} arcs total) ===`);
arcs.forEach((el, i) => {
  const a = el._arc;
  // Compute midpoint of arc
  const t1 = Math.atan2(el.y1 - a.cy, el.x1 - a.cx);
  const t2 = Math.atan2(el.y2 - a.cy, el.x2 - a.cx);
  let tMid;
  if (a.sweep === 1) {
    tMid = t1 < t2 ? (t1 + t2) / 2 : (t1 + t2 + 2 * Math.PI) / 2;
  } else {
    tMid = t1 > t2 ? (t1 + t2) / 2 : (t1 + t2 - 2 * Math.PI) / 2;
  }
  const mx = a.cx + a.r * Math.cos(tMid);
  const my = a.cy + a.r * Math.sin(tMid);
  
  // The "corner" is where the two tangent lines intersect (the step corner)
  // For a quarter-circle fillet, corner is at distance r*sqrt(2) from center
  // Midpoint is at distance r from center
  // If arc is inward (concave), midpoint should be CLOSER to the corner
  // than the radius
  const cornerX = a.cx + (el.x1 - a.cx < 0 ? -a.r : (el.x1 - a.cx > 0 ? a.r : 0));
  const cornerY = a.cy + (el.y1 - a.cy < 0 ? -a.r : (el.y1 - a.cy > 0 ? a.r : 0));
  
  // Simplified: just check midpoint distance to center vs r
  const distFromCenter = Math.sqrt((mx - a.cx)**2 + (my - a.cy)**2);
  
  console.log(`  ARC${i+1}: r=${a.r.toFixed(1)}, sweep=${a.sweep}, ` +
    `from=(${el.x1.toFixed(1)},${el.y1.toFixed(1)}) to=(${el.x2.toFixed(1)},${el.y2.toFixed(1)}), ` +
    `center=(${a.cx.toFixed(1)},${a.cy.toFixed(1)}), mid=(${mx.toFixed(1)},${my.toFixed(1)})`);
});

// Filter boss arcs (smaller radii, not the big gear circle arcs)
const bossArcs = arcs.filter(el => el._arc.r < 10);
console.log(`\n=== BOSS FILLET ARCS (${bossArcs.length}) ===`);
bossArcs.forEach((el, i) => {
  const a = el._arc;
  const label = a.r === 4 ? 'Boss1' : (a.r === 3 ? 'Boss2' : 'Other');
  console.log(`  ${label} ARC: r=${a.r.toFixed(1)}, sweep=${a.sweep}, ` +
    `(${el.x1.toFixed(1)},${el.y1.toFixed(1)}) -> (${el.x2.toFixed(1)},${el.y2.toFixed(1)})`);
});

// Generate SVG
let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">\n';
svg += '<rect width="1200" height="700" fill="white"/>\n';

// Title
svg += '<text x="600" y="30" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">Boss R-Value Fillet Verification - Inward (Concave) Fillets at Step Transitions</text>\n';

result.elements.forEach(el => {
  if (el._arc && el._arc.r > 0) {
    const r = el._arc.r, sw = el._arc.sweep !== undefined ? el._arc.sweep : 0;
    // Color boss fillets differently for visibility
    const isBossFillet = r < 10;
    const color = isBossFillet ? '#ff0000' : (el.color || '#000');
    const width = isBossFillet ? 2.5 : (el.thickness || 1);
    svg += `<path d="M ${el.x1.toFixed(2)} ${el.y1.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 ${sw} ${el.x2.toFixed(2)} ${el.y2.toFixed(2)}" stroke="${color}" stroke-width="${width}" fill="none"/>\n`;
    
    // Add annotation circle at arc center for boss fillets
    if (isBossFillet) {
      svg += `<circle cx="${el._arc.cx.toFixed(2)}" cy="${el._arc.cy.toFixed(2)}" r="2" fill="${color}" opacity="0.5"/>\n`;
    }
  } else if (el.type === "outline" || el.type === "hidden-line") {
    const dash = el.type === "hidden-line" ? ' stroke-dasharray="6,3"' : "";
    svg += `<line x1="${el.x1.toFixed(2)}" y1="${el.y1.toFixed(2)}" x2="${el.x2.toFixed(2)}" y2="${el.y2.toFixed(2)}" stroke="${el.color||'#000'}" stroke-width="${el.thickness||1}"${dash}/>\n`;
  } else if (el.type === "center-line") {
    svg += `<line x1="${el.x1.toFixed(2)}" y1="${el.y1.toFixed(2)}" x2="${el.x2.toFixed(2)}" y2="${el.y2.toFixed(2)}" stroke="${el.color||'#999'}" stroke-width="0.5" stroke-dasharray="12,4,3,4"/>\n`;
  }
});

// Add legend
svg += '<rect x="20" y="640" width="300" height="50" fill="#f8f8f8" stroke="#ccc"/>\n';
svg += '<line x1="30" y1="660" x2="60" y2="660" stroke="#ff0000" stroke-width="2.5"/>\n';
svg += '<text x="65" y="665" font-family="Arial" font-size="12" fill="#333">Boss R-value fillet (inward at step)</text>\n';
svg += '<text x="30" y="682" font-family="Arial" font-size="10" fill="#666">Boss1: TL=sweep1, BL=sweep1, TR=sweep0, BR=sweep0</text>\n';

svg += '</svg>';

fs.writeFileSync("test_step_fillet_result.svg", svg);
console.log(`\nSVG written with ${result.elements.length} elements, ${arcs.length} arcs`);
console.log("Placeholder count:", result.elements.filter(e => e.confidence === "placeholder").length);
