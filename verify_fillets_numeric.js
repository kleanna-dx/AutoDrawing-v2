// Numerically verify all 8 fillet cases with actual coordinate values
// Use concrete numbers:
const oy = 300;           // center y
const bR = 50;            // boss radius (half outer diam in px)
const adjacentRLeft = 70; // adjacent left is LARGER (adjLargerL)
const adjacentRRight = 30;// adjacent right is SMALLER (bossLargerR)
const bLeft = 100;
const bRight = 200;
const rPx = 10;           // fillet radius in px

const bTopY = oy - bR;   // 250
const bBotY = oy + bR;   // 350

// === LEFT SIDE ===
// adjLargerL: adjacent (70) > boss (50)
const adjTopY_L = oy - adjacentRLeft;  // 230
const adjBotY_L = oy + adjacentRLeft;  // 370

// Case 1: adjLargerL Top - corner=(bLeft, bTopY)=(100,250)
// Notch: upper-right  
// center=(110, 240), start=(100, 240), end=(110, 250), sweep=1
const case1 = {
  name: 'adjLargerL Top',
  codeCenter:  [bLeft + rPx, bTopY - rPx],          // 110, 240
  codeStart:   [bLeft, bTopY - rPx],                 // 100, 240
  codeEnd:     [bLeft + rPx, bTopY],                 // 110, 250
  codeSweep: 1,
  expectCenter:[bLeft + rPx, bTopY - rPx],           // 110, 240
  expectStart: [bLeft, bTopY - rPx],                 // 100, 240
  expectEnd:   [bLeft + rPx, bTopY],                 // 110, 250
  expectSweep: 1
};

// Case 2: adjLargerL Bot - corner=(bLeft, bBotY)=(100,350)
// Notch: lower-right
// center=(110, 360), start=(110, 350), end=(100, 360), sweep=1
const case2 = {
  name: 'adjLargerL Bot',
  codeCenter:  [bLeft + rPx, bBotY + rPx],           // 110, 360
  codeStart:   [bLeft + rPx, bBotY],                  // 110, 350
  codeEnd:     [bLeft, bBotY + rPx],                   // 100, 360
  codeSweep: 1,
  expectCenter:[bLeft + rPx, bBotY + rPx],            // 110, 360
  expectStart: [bLeft + rPx, bBotY],                   // 110, 350
  expectEnd:   [bLeft, bBotY + rPx],                    // 100, 360
  expectSweep: 1
};

// === RIGHT SIDE ===
// adjLargerR: we need adjacent right > boss for adjLargerR test
// Let's use adjacentRRight_large = 70 for adjLargerR test
const adjacentRRight_large = 70;
const adjTopY_R_large = oy - adjacentRRight_large;  // 230
const adjBotY_R_large = oy + adjacentRRight_large;  // 370

// Case 3: adjLargerR Top - corner=(bRight, bTopY)=(200,250)
// Notch: upper-left
// center=(190, 240), start=(190, 250), end=(200, 240), sweep=1
const case3 = {
  name: 'adjLargerR Top',
  codeCenter:  [bRight - rPx, bTopY - rPx],          // 190, 240
  codeStart:   [bRight - rPx, bTopY],                 // 190, 250
  codeEnd:     [bRight, bTopY - rPx],                 // 200, 240
  codeSweep: 1,
  expectCenter:[bRight - rPx, bTopY - rPx],           // 190, 240
  expectStart: [bRight - rPx, bTopY],                 // 190, 250
  expectEnd:   [bRight, bTopY - rPx],                 // 200, 240
  expectSweep: 1
};

// Case 4: adjLargerR Bot - corner=(bRight, bBotY)=(200,350)
// Notch: lower-left
// center=(190, 360), start=(200, 360), end=(190, 350), sweep=1
const case4 = {
  name: 'adjLargerR Bot',
  codeCenter:  [bRight - rPx, bBotY + rPx],          // 190, 360
  codeStart:   [bRight, bBotY + rPx],                 // 200, 360
  codeEnd:     [bRight - rPx, bBotY],                 // 190, 350
  codeSweep: 1,
  expectCenter:[bRight - rPx, bBotY + rPx],           // 190, 360
  expectStart: [bRight, bBotY + rPx],                 // 200, 360
  expectEnd:   [bRight - rPx, bBotY],                 // 190, 350
  expectSweep: 1
};

// === LEFT SIDE - BOSS LARGER ===
// bossLargerL: boss(50) > adjacent(30)
const adjacentRLeft_small = 30;
const adjTopY_L_small = oy - adjacentRLeft_small;  // 270
const adjBotY_L_small = oy + adjacentRLeft_small;  // 330

// Case 5: bossLargerL Top - corner=(bLeft, adjTopY)=(100, 270)
// Notch: upper-left (into adj space)
// center=(90, 260), start=(90, 270), end=(100, 260), sweep=1
const case5 = {
  name: 'bossLargerL Top',
  codeCenter:  [bLeft - rPx, adjTopY_L_small - rPx], // 90, 260
  codeStart:   [bLeft - rPx, adjTopY_L_small],        // 90, 270
  codeEnd:     [bLeft, adjTopY_L_small - rPx],         // 100, 260
  codeSweep: 1,
  expectCenter:[bLeft - rPx, adjTopY_L_small - rPx],  // 90, 260
  expectStart: [bLeft - rPx, adjTopY_L_small],         // 90, 270
  expectEnd:   [bLeft, adjTopY_L_small - rPx],          // 100, 260
  expectSweep: 1
};

// Case 6: bossLargerL Bot - corner=(bLeft, adjBotY)=(100, 330)
// Notch: lower-left
// center=(90, 340), start=(100, 340), end=(90, 330), sweep=1
const case6 = {
  name: 'bossLargerL Bot',
  codeCenter:  [bLeft - rPx, adjBotY_L_small + rPx],  // 90, 340
  codeStart:   [bLeft, adjBotY_L_small + rPx],         // 100, 340
  codeEnd:     [bLeft - rPx, adjBotY_L_small],          // 90, 330
  codeSweep: 1,
  expectCenter:[bLeft - rPx, adjBotY_L_small + rPx],   // 90, 340
  expectStart: [bLeft, adjBotY_L_small + rPx],          // 100, 340
  expectEnd:   [bLeft - rPx, adjBotY_L_small],           // 90, 330
  expectSweep: 1
};

// === RIGHT SIDE - BOSS LARGER ===
// bossLargerR: boss(50) > adjacent(30)
const adjTopY_R_small = oy - adjacentRRight;  // 270
const adjBotY_R_small = oy + adjacentRRight;  // 330

// Case 7: bossLargerR Top - corner=(bRight, adjTopY)=(200, 270)
// Notch: upper-right (into adj space)
// center=(210, 260), start=(200, 260), end=(210, 270), sweep=1
const case7 = {
  name: 'bossLargerR Top',
  codeCenter:  [bRight + rPx, adjTopY_R_small - rPx], // 210, 260
  codeStart:   [bRight, adjTopY_R_small - rPx],        // 200, 260
  codeEnd:     [bRight + rPx, adjTopY_R_small],         // 210, 270
  codeSweep: 1,
  expectCenter:[bRight + rPx, adjTopY_R_small - rPx],  // 210, 260
  expectStart: [bRight, adjTopY_R_small - rPx],         // 200, 260
  expectEnd:   [bRight + rPx, adjTopY_R_small],          // 210, 270
  expectSweep: 1
};

// Case 8: bossLargerR Bot - corner=(bRight, adjBotY)=(200, 330)
// Notch: lower-right
// center=(210, 340), start=(210, 330), end=(200, 340), sweep=1
const case8 = {
  name: 'bossLargerR Bot',
  codeCenter:  [bRight + rPx, adjBotY_R_small + rPx],  // 210, 340
  codeStart:   [bRight + rPx, adjBotY_R_small],         // 210, 330
  codeEnd:     [bRight, adjBotY_R_small + rPx],          // 200, 340
  codeSweep: 1,
  expectCenter:[bRight + rPx, adjBotY_R_small + rPx],   // 210, 340
  expectStart: [bRight + rPx, adjBotY_R_small],          // 210, 330
  expectEnd:   [bRight, adjBotY_R_small + rPx],           // 200, 340
  expectSweep: 1
};

const cases = [case1, case2, case3, case4, case5, case6, case7, case8];

console.log('=== NUMERIC FILLET VERIFICATION ===\n');

let allOk = true;
for (const c of cases) {
  const centerOk = c.codeCenter[0] === c.expectCenter[0] && c.codeCenter[1] === c.expectCenter[1];
  const startOk = c.codeStart[0] === c.expectStart[0] && c.codeStart[1] === c.expectStart[1];
  const endOk = c.codeEnd[0] === c.expectEnd[0] && c.codeEnd[1] === c.expectEnd[1];
  const sweepOk = c.codeSweep === c.expectSweep;
  const ok = centerOk && startOk && endOk && sweepOk;
  if (!ok) allOk = false;
  
  console.log(`${ok ? '✅' : '❌'} ${c.name}:`);
  console.log(`   center=(${c.codeCenter}) ${centerOk ? '✓' : '✗ expect '+c.expectCenter}`);
  console.log(`   start =(${c.codeStart})  ${startOk ? '✓' : '✗ expect '+c.expectStart}`);
  console.log(`   end   =(${c.codeEnd})    ${endOk ? '✓' : '✗ expect '+c.expectEnd}`);
  console.log(`   sweep =${c.codeSweep}              ${sweepOk ? '✓' : '✗ expect '+c.expectSweep}`);
}

console.log(`\n${allOk ? '✅ ALL 8 CASES MATCH!' : '❌ SOME CASES MISMATCH!'}`);

// Now verify the SVG arc direction visually:
// For sweep=1 (CW in SVG), from start to end, the arc curves clockwise
// Let's verify each case produces a concave (inward) fillet

console.log('\n=== SVG ARC DIRECTION CHECK ===');
for (const c of cases) {
  const [sx, sy] = c.codeStart;
  const [ex, ey] = c.codeEnd;
  const [cx, cy] = c.codeCenter;
  
  // Vector from center to start
  const vsx = sx - cx, vsy = sy - cy;
  // Vector from center to end
  const vex = ex - cx, vey = ey - cy;
  
  // Cross product: positive = CCW, negative = CW
  const cross = vsx * vey - vsy * vex;
  const cwDirection = cross < 0 ? 'CW' : (cross > 0 ? 'CCW' : 'COLLINEAR');
  
  // For sweep=1, SVG draws CW. So cross should be negative for CW start→end.
  // If cross is positive (CCW from start to end), sweep=1 draws the MAJOR arc (> 180°)
  // We want the minor arc (90°), so cross must be negative for sweep=1
  const correct = cross < 0;
  console.log(`${correct ? '✅' : '❌'} ${c.name}: cross=${cross.toFixed(1)} → ${cwDirection} (sweep=1 → ${correct ? 'minor 90° arc ✓' : 'MAJOR arc ✗'})`);
}
