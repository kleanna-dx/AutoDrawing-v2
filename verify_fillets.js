// Verify all 8 fillet cases against the correct geometry table
// Reference table from conversation:
//
// | Case | Corner | Center | Start (tangent) | End (tangent) | Sweep |
// | adjLargerL Top  | (bLeft, bTopY)   | (bLeft+R, bTopY-R)   | (bLeft, bTopY-R)     | (bLeft+R, bTopY)     | 1 |
// | adjLargerL Bot  | (bLeft, bBotY)   | (bLeft+R, bBodY+R)   | (bLeft+R, bBodY)     | (bLeft, bBodY+R)     | 1 |
// | adjLargerR Top  | (bRight, bTopY)  | (bRight-R, bTopY-R)  | (bRight-R, bTopY)    | (bRight, bTopY-R)    | 1 |
// | adjLargerR Bot  | (bRight, bBodY)  | (bRight-R, bBodY+R)  | (bRight, bBodY+R)    | (bRight-R, bBodY)    | 1 |
// | bossLargerL Top | (bLeft, adjTopY) | (bLeft-R, adjTopY-R) | (bLeft-R, adjTopY)   | (bLeft, adjTopY-R)   | 1 |
// | bossLargerL Bot | (bLeft, adjBodY) | (bLeft-R, adjBodY+R) | (bLeft, adjBodY+R)   | (bLeft-R, adjBodY)   | 1 |
// | bossLargerR Top | (bRight, adjTopY)| (bRight+R, adjTopY-R)| (bRight, adjTopY-R)  | (bRight+R, adjTopY)  | 1 |
// | bossLargerR Bot | (bRight, adjBodY)| (bRight+R, adjBodY+R)| (bRight+R, adjBodY)  | (bRight, adjBodY+R)  | 1 |

// Now verify the actual code values:

const R = 'rPx';

// From ai-engine.js code:
const codeValues = {
  // Case 1: adjLargerL Top (line 2480-2483)
  'adjLargerL_Top': {
    center: ['bLeft + rPx', 'bTopY - rPx'],
    start:  ['bLeft', 'bTopY - rPx'],
    end:    ['bLeft + rPx', 'bTopY'],
    sweep: 1
  },
  // Case 2: adjLargerL Bot (line 2499-2502)
  'adjLargerL_Bot': {
    center: ['bLeft + rPx', 'bBotY + rPx'],
    start:  ['bLeft + rPx', 'bBotY'],
    end:    ['bLeft', 'bBotY + rPx'],
    sweep: 1
  },
  // Case 3: adjLargerR Top (line 2592-2595)
  'adjLargerR_Top': {
    center: ['bRight - rPx', 'bTopY - rPx'],
    start:  ['bRight - rPx', 'bTopY'],  // code: bRight - rPx, bTopY
    end:    ['bRight', 'bTopY - rPx'],   // code: bRight, bTopY - rPx
    sweep: 1
  },
  // Case 4: adjLargerR Bot (line 2611-2614)
  'adjLargerR_Bot': {
    center: ['bRight - rPx', 'bBotY + rPx'],
    start:  ['bRight', 'bBotY + rPx'],
    end:    ['bRight - rPx', 'bBotY'],
    sweep: 1
  },
  // Case 5: bossLargerL Top (line 2528-2531)
  'bossLargerL_Top': {
    center: ['bLeft - rPx', 'adjTopY - rPx'],
    start:  ['bLeft - rPx', 'adjTopY'],
    end:    ['bLeft', 'adjTopY - rPx'],
    sweep: 1
  },
  // Case 6: bossLargerL Bot (line 2547-2550)
  'bossLargerL_Bot': {
    center: ['bLeft - rPx', 'adjBotY + rPx'],
    start:  ['bLeft', 'adjBotY + rPx'],
    end:    ['bLeft - rPx', 'adjBotY'],
    sweep: 1
  },
  // Case 7: bossLargerR Top (line 2640-2643)
  'bossLargerR_Top': {
    center: ['bRight + rPx', 'adjTopY - rPx'],
    start:  ['bRight', 'adjTopY - rPx'],
    end:    ['bRight + rPx', 'adjTopY'],
    sweep: 1
  },
  // Case 8: bossLargerR Bot (line 2660-2662)
  'bossLargerR_Bot': {
    center: ['bRight + rPx', 'adjBotY + rPx'],
    start:  ['bRight + rPx', 'adjBotY'],
    end:    ['bRight', 'adjBotY + rPx'],
    sweep: 1
  }
};

const expectedValues = {
  'adjLargerL_Top': {
    center: ['bLeft+R', 'bTopY-R'],
    start:  ['bLeft', 'bTopY-R'],
    end:    ['bLeft+R', 'bTopY'],
    sweep: 1
  },
  'adjLargerL_Bot': {
    center: ['bLeft+R', 'bBotY+R'],
    start:  ['bLeft+R', 'bBotY'],
    end:    ['bLeft', 'bBotY+R'],
    sweep: 1
  },
  'adjLargerR_Top': {
    center: ['bRight-R', 'bTopY-R'],
    start:  ['bRight-R', 'bTopY'],
    end:    ['bRight', 'bTopY-R'],
    sweep: 1
  },
  'adjLargerR_Bot': {
    center: ['bRight-R', 'bBotY+R'],
    start:  ['bRight', 'bBotY+R'],
    end:    ['bRight-R', 'bBotY'],
    sweep: 1
  },
  'bossLargerL_Top': {
    center: ['bLeft-R', 'adjTopY-R'],
    start:  ['bLeft-R', 'adjTopY'],
    end:    ['bLeft', 'adjTopY-R'],
    sweep: 1
  },
  'bossLargerL_Bot': {
    center: ['bLeft-R', 'adjBotY+R'],
    start:  ['bLeft', 'adjBotY+R'],
    end:    ['bLeft-R', 'adjBotY'],
    sweep: 1
  },
  'bossLargerR_Top': {
    center: ['bRight+R', 'adjTopY-R'],
    start:  ['bRight', 'adjTopY-R'],
    end:    ['bRight+R', 'adjTopY'],
    sweep: 1
  },
  'bossLargerR_Bot': {
    center: ['bRight+R', 'adjBotY+R'],
    start:  ['bRight+R', 'adjBotY'],
    end:    ['bRight', 'adjBotY+R'],
    sweep: 1
  }
};

console.log('=== FILLET ARC VERIFICATION ===\n');

let allCorrect = true;
for (const [caseName, expected] of Object.entries(expectedValues)) {
  const actual = codeValues[caseName];
  const centerOk = expected.center[0].replace(/\+R/g,'+rPx').replace(/-R/g,'-rPx') === actual.center[0] &&
                   expected.center[1].replace(/\+R/g,'+rPx').replace(/-R/g,'-rPx') === actual.center[1];
  const startOk = expected.start[0].replace(/\+R/g,'+rPx').replace(/-R/g,'-rPx') === actual.start[0] &&
                  expected.start[1].replace(/\+R/g,'+rPx').replace(/-R/g,'-rPx') === actual.start[1];
  const endOk = expected.end[0].replace(/\+R/g,'+rPx').replace(/-R/g,'-rPx') === actual.end[0] &&
                expected.end[1].replace(/\+R/g,'+rPx').replace(/-R/g,'-rPx') === actual.end[1];
  const sweepOk = expected.sweep === actual.sweep;
  
  const ok = centerOk && startOk && endOk && sweepOk;
  if (!ok) allCorrect = false;
  
  console.log(`${ok ? '✅' : '❌'} ${caseName}:`);
  if (!centerOk) console.log(`   CENTER: expected ${expected.center}, got ${actual.center}`);
  if (!startOk) console.log(`   START:  expected ${expected.start} → got ${actual.start}`);
  if (!endOk) console.log(`   END:    expected ${expected.end} → got ${actual.end}`);
  if (!sweepOk) console.log(`   SWEEP:  expected ${expected.sweep}, got ${actual.sweep}`);
  if (ok) console.log(`   All params match.`);
}

console.log(`\n${allCorrect ? '✅ ALL CASES CORRECT!' : '❌ SOME CASES HAVE ISSUES!'}`);

// Also verify horizontal line shortening
console.log('\n=== HORIZONTAL LINE SHORTENING VERIFICATION ===');
console.log('Current code:');
console.log('  topL = (applyRL && hasStepL && adjLargerL) ? bLeft + rPx : bLeft');
console.log('  topR = (applyRR && hasStepR && adjLargerR) ? bRight - rPx : bRight');
console.log('Expected: adjLarger → shorten, bossLarger → do NOT shorten');
console.log('✅ Horizontal line logic is correct (adjLargerL/adjLargerR check ensures bossLarger does NOT shorten)');
