const fs = require('fs');
const vm = require('vm');

const dmCode = fs.readFileSync('js/drawing-model.js', 'utf8');
const aeCode = fs.readFileSync('js/ai-engine.js', 'utf8');

const mockDoc = { getElementById: () => null, querySelectorAll: () => [] };
const context = vm.createContext({ 
  console, require, global, setTimeout, clearTimeout, document: mockDoc
});

vm.runInContext(dmCode, context);
vm.runInContext(aeCode, context);

const runCode = `
const baseSpec = JSON.parse(JSON.stringify(AIEngine.DEMO_SHAFT_SPEC));
baseSpec.chainGears = [{
  id: 'CG1', section: 'S2', side: 'left', type: 'chain',
  outerDiam: 35, boreDiam: 15, gearWidth: 8,
  teeth: 17, pitch: 'RS40',
  confidence: 'confirmed',
  boss: {
    count: 2,
    bosses: [
      { outerDiam: 28, thickness: 15, fillet: { value: 4, side: 'both' } },
      { outerDiam: 24, thickness: 10, fillet: { value: 3, side: 'both' } }
    ]
  }
}];

const doc = AIEngine.generateFromCustomSpec(baseSpec);
const arcs = doc.elements.filter(e => e._arc && e._arc.r > 0);
const outlines = doc.elements.filter(e => e.type === 'outline');
({ arcs, outlines, totalElements: doc.elements.length });
`;

const { arcs, outlines, totalElements } = vm.runInContext(runCode, context);

console.log('Total elements:', totalElements);
const filletArcs = arcs.filter(a => a._arc.r < 20);
console.log('Boss fillet arcs:', filletArcs.length);
filletArcs.forEach((a, i) => {
  const arc = a._arc;
  console.log(`FILLET${i+1}: r=${arc.r.toFixed(1)} sweep=${arc.sweep} M(${a.x1.toFixed(1)},${a.y1.toFixed(1)}) → (${a.x2.toFixed(1)},${a.y2.toFixed(1)}) center=(${arc.cx.toFixed(1)},${arc.cy.toFixed(1)})`);
});

// SVG - fix undefined sweep
const svgParts = outlines.map(el => {
  if (el._arc && el._arc.r > 0) {
    const {r, cx, cy} = el._arc;
    const sweep = el._arc.sweep != null ? el._arc.sweep : 0;
    return `<path d="M ${el.x1.toFixed(1)} ${el.y1.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep} ${el.x2.toFixed(1)} ${el.y2.toFixed(1)}" stroke="red" stroke-width="0.8" fill="none"/>
    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" stroke="#ddd" stroke-width="0.3" stroke-dasharray="1,1" fill="none"/>`;
  }
  return `<line x1="${el.x1.toFixed(1)}" y1="${el.y1.toFixed(1)}" x2="${el.x2.toFixed(1)}" y2="${el.y2.toFixed(1)}" stroke="black" stroke-width="0.5"/>`;
}).join('\n');

fs.writeFileSync('test_engine_fillet.svg', `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="250 310 80 95" width="800" height="950">
<rect x="250" y="310" width="80" height="95" fill="white"/>
${svgParts}
</svg>`);

fs.writeFileSync('test_engine_fillet_full.svg', `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 750" width="900" height="750">
<rect width="900" height="750" fill="white"/>
${svgParts}
</svg>`);

console.log('Written SVG files');
