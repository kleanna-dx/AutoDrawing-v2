// Let's analyze the actual arc paths from the SVG
// Boss1 top arcs (adjLargerL case - gear is larger than boss1):
// Arc 1: M 342.5 315.3 A 8.0 8.0 0 0 1 350.5 323.3 (boss1 left-top, adjLargerL)
// Arc 2: M 350.5 379.3 A 8.0 8.0 0 0 1 342.5 387.3 (boss1 left-bottom, adjLargerL)
// Arc 3: M 372.5 319.3 A 8.0 8.0 0 0 1 380.5 327.3 (boss1 right-top)
// Arc 4: M 380.5 375.3 A 8.0 8.0 0 0 1 372.5 383.3 (boss1 right-bottom)

// Let me figure out the actual geometry
// First, what are the boss dimensions?
// From the DEMO_SHAFT_SPEC, gear OD=35mm, boss1 OD=28mm, boss2 OD=24mm, shaft OD=20mm

// Arc 1: start=(342.5, 315.3), end=(350.5, 323.3), R=8
// This means: the arc starts at x=342.5 (which is bLeft of boss1) 
// and ends at y=323.3 (which is bTopY of boss1)
// 
// The 90° corner is at (342.5, 323.3) = (bLeft, bTopY)
// Start is at (342.5, 323.3 - 8) = (bLeft, bTopY - R)
// End is at (342.5 + 8, 323.3) = (bLeft + R, bTopY)
//
// Center: (bLeft + R, bTopY - R) = (350.5, 315.3)
//
// Wait... the center is at (350.5, 315.3)
// The corner is at (342.5, 323.3)
//
// The center is ABOVE and to the RIGHT of the corner
// That means the notch is to the upper-right
// The adjacent (gear) is larger, so:
//   adjTopY < bTopY (gear extends higher)
//   The step goes: adjTopY (higher) → bTopY (lower) at x=bLeft
//   
// So the notch (open space) IS upper-right of the corner
// Center in the notch → arc curves AWAY from the notch
// 
// But the user wants the arc to curve INTO the corner (replacing the sharp corner)
// For a CONCAVE fillet, the arc should curve inward

// Let me think about this differently with the reference image:
// Reference: two plates meet at 90°, R-value applied to the INSIDE of the bend
// The inner R is the fillet radius
// The arc CENTER is at distance R from both lines, on the INSIDE (material) side
// The arc itself is on the inside of the corner

// Current situation in our code:
// Two lines meet at 90° corner (e.g., vertical step + horizontal boss top)
// We're drawing the arc with center in the NOTCH (empty space)
// This means the arc is on the OUTSIDE of the corner

// CORRECT: center should be on the MATERIAL side
// For adjLargerL Top corner at (bLeft, bTopY):
//   The material is to the RIGHT and BELOW the corner
//   Center should be at (bLeft + R, bTopY + R) ← inside the boss material!
//   Start = (bLeft, bTopY + R) on the vertical step line
//   End = (bLeft + R, bTopY) on the horizontal boss line

// Wait, that doesn't make sense either. Let me reconsider.

// The user's reference image shows a PIPE BEND:
//   - Inner radius = R (small, tight curve)
//   - Outer radius = R + plate thickness (larger curve)
//   - Both curves are CONCAVE when viewed from outside

// Our situation is a STEP/SHOULDER between two different diameters:
//
//   adjTopY  ──────────┐ (gear edge)
//                       │ vertical step
//   bTopY   ────────────┘ boss top edge (corner here)
//            boss →
//
// The 90° INSIDE corner is at (bLeft, bTopY)
// "Inside" means: the corner that faces the material interior
// The fillet R replaces this sharp corner with a smooth curve
// 
// For a proper CONCAVE fillet at this inside corner:
//   The fillet arc curves INWARD from the step into the boss material
//   This means the arc center is on the MATERIAL side: (bLeft + R, bTopY + R)
//   But wait... that's INSIDE the boss rectangle

// Actually, I think the confusion is about what "concave" means here.
// Let me look at the image analysis more carefully...

console.log('=== Current Arc Analysis ===');
console.log('');
console.log('Arc 1 (adjLargerL Top):');
console.log('  Start: (342.5, 315.3) = (bLeft, bTopY - R)');
console.log('  End:   (350.5, 323.3) = (bLeft + R, bTopY)');
console.log('  R: 8, sweep: 1');
console.log('  Center: (350.5, 315.3) = (bLeft + R, bTopY - R) ← in the NOTCH');
console.log('  Corner: (342.5, 323.3) = (bLeft, bTopY) ← 90° vertex');
console.log('');
console.log('  Profile shape:');
console.log('                    adjTopY');  
console.log('  gear extends  ────┐');
console.log('  higher up          │ step line (vertical)');
console.log('  (S)→ ○             │');
console.log('       arc           │');
console.log('  bTopY  ──────────┘ (E)→ boss horizontal');
console.log('');
console.log('  With center in notch (upper-right), sweep=1:');
console.log('  Arc goes CW from S=(bLeft, bTopY-R) to E=(bLeft+R, bTopY)');
console.log('  This makes the arc CONVEX relative to the corner');
console.log('  i.e., it BULGES into the notch space');
console.log('');
console.log('  User wants: arc CONCAVE = curves INTO the corner');
console.log('  = the sharp corner gets rounded, material is REMOVED at the corner');
console.log('');
console.log('  For CONCAVE fillet:');
console.log('  Center should be at (bLeft + R, bTopY + R) = INSIDE the boss material');
console.log('  Start on step line: (bLeft, bTopY + R)');
console.log('  End on boss top: (bLeft + R, bTopY)');
console.log('  Arc from (bLeft, bTopY+R) to (bLeft+R, bTopY) with center at (bLeft+R, bTopY+R)');
console.log('  sweep = 0 (CCW) for this arrangement');

// Let me verify:
const bLeft = 342.5;
const bTopY = 323.3;
const R = 8;

// Current (wrong)
const cx_wrong = bLeft + R;    // 350.5
const cy_wrong = bTopY - R;    // 315.3
const sx_wrong = bLeft;         // 342.5
const sy_wrong = bTopY - R;    // 315.3
const ex_wrong = bLeft + R;    // 350.5
const ey_wrong = bTopY;        // 323.3

// Proposed (correct concave)
const cx_right = bLeft + R;    // 350.5
const cy_right = bTopY + R;    // 331.3  ← INSIDE boss
const sx_right = bLeft;         // 342.5
const sy_right = bTopY + R;    // 331.3  ← R below bTopY on step line
const ex_right = bLeft + R;    // 350.5
const ey_right = bTopY;        // 323.3  ← R right of bLeft on boss top line

console.log('\n=== Correct Concave Fillet ===');
console.log(`Center: (${cx_right}, ${cy_right})`);
console.log(`Start:  (${sx_right}, ${sy_right}) ← on vertical step, R below bTopY`);
console.log(`End:    (${ex_right}, ${ey_right}) ← on horizontal boss top, R right of bLeft`);

// Check sweep direction
const vsx = sx_right - cx_right;  // -8
const vsy = sy_right - cy_right;  // 0
const vex = ex_right - cx_right;  // 0
const vey = ey_right - cy_right;  // -8
const cross = vsx * vey - vsy * vex; // -8 * -8 - 0 * 0 = 64
console.log(`Cross product: ${cross} → ${cross > 0 ? 'CCW' : 'CW'}`);
console.log(`For sweep=0 (CCW): arc goes CCW from start to end`);
console.log(`This gives a concave quarter circle that rounds the inner corner`);

console.log('\n=== WAIT - Re-examining ===');
console.log('The step line goes from adjTopY to bTopY (top to bottom)');
console.log('If we move start R units BELOW bTopY, it goes into boss interior');
console.log('But the boss has material there! The step line ENDS at bTopY');
console.log('We cannot extend below bTopY on the step line');
console.log('');
console.log('ACTUALLY: For a concave fillet at an inside corner:');
console.log('The fillet REMOVES the sharp corner and replaces it with a curve');
console.log('Start point: R units FROM the corner ALONG one line');
console.log('End point: R units FROM the corner ALONG the other line');
console.log('');
console.log('For adjLargerL Top: corner=(bLeft, bTopY)');
console.log('Line 1: vertical step going UP from corner → start=(bLeft, bTopY-R)');
console.log('Line 2: horizontal boss going RIGHT from corner → end=(bLeft+R, bTopY)');
console.log('');
console.log('The tangent points are ABOVE and to the RIGHT of corner');
console.log('The arc CENTER is on the OPPOSITE side of the corner from the notch');
console.log('');
console.log('No wait. In the current code:');
console.log('Center=(bLeft+R, bTopY-R) is in the notch');
console.log('With sweep=1, the arc goes from (bLeft, bTopY-R) CW to (bLeft+R, bTopY)');
console.log('This arc REPLACES the corner with a smooth inward curve');
console.log('');
console.log('Let me draw this ASCII:');
console.log('');
console.log('  adjTopY ─────────────┐');
console.log('                        │');
console.log('           S•    ○C     │');  
console.log('             ╲          │');
console.log('  bTopY ──────•E───────┘');
console.log('             boss');
console.log('');
console.log('The arc from S to E (CW) would curve TOWARD upper-right');
console.log('i.e., the arc goes UP and RIGHT from S, then DOWN to E');
console.log('This means the arc BULGES into the notch (convex into notch)');
console.log('From the boss perspective, this is CONCAVE (material removed)');
console.log('');
console.log('BUT WAIT: if we draw it in screen coordinates (Y grows downward):');
console.log('S=(342.5, 315.3) is at TOP (smaller Y)');
console.log('E=(350.5, 323.3) is at BOTTOM-RIGHT (larger Y, larger X)');
console.log('Center=(350.5, 315.3) is at TOP-RIGHT');
console.log('');
console.log('CW in SVG (Y-down): from S going RIGHT then DOWN to E');
console.log('The arc path: S → right along top → down to E');
console.log('This looks like a quarter circle opening toward lower-left');
console.log('= toward the corner');
console.log('= CONVEX bulge INTO the notch space');
console.log('');
console.log('THIS IS THE PROBLEM!');
console.log('The user wants the fillet to be CONCAVE (curved inward)');
console.log('like in the reference: a smooth inner bend, not a bump');
