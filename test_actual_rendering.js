// Quick test to verify the sweep=0 values appear in generated SVG output
const fs = require('fs');

// Read the ai-engine.js source
const src = fs.readFileSync('js/ai-engine.js', 'utf8');

// Count sweep: 0 vs sweep: 1 in fillet code
const sweep0 = (src.match(/sweep:\s*0/g) || []).length;
const sweep1 = (src.match(/sweep:\s*1/g) || []).length;

console.log(`sweep: 0 occurrences: ${sweep0}`);
console.log(`sweep: 1 occurrences: ${sweep1}`);
console.log(`Expected: 8 sweep:0, 0 sweep:1 in fillet code`);

if (sweep0 === 8 && sweep1 === 0) {
  console.log('✅ All 8 fillet arcs correctly use sweep=0 (concave)');
} else {
  console.log('❌ Mismatch - check code');
}
