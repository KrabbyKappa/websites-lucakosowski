import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyCarouselIntent,
  decideCarouselRelease,
  sampleCarouselVelocity,
  stepCarouselSpring,
} from '../src/lib/carouselPhysics.mjs';

const release = (overrides = {}) => decideCarouselRelease({
  distanceX: 0,
  velocityX: 0,
  originIndex: 3,
  itemCount: 8,
  theta: 45,
  originAngle: -135,
  ...overrides,
});

test('a lazy sideways gesture with slight downward drift locks horizontally', () => {
  assert.equal(classifyCarouselIntent({ deltaX: 6, deltaY: 8, currentIntent: 'pending' }), 'horizontal');
});

test('a clearly vertical gesture remains owned by page scrolling', () => {
  assert.equal(classifyCarouselIntent({ deltaX: 2, deltaY: 10, currentIntent: 'pending' }), 'vertical');
});

test('tiny undecided movement remains pending', () => {
  assert.equal(classifyCarouselIntent({ deltaX: 1, deltaY: 1, currentIntent: 'pending' }), 'pending');
});

test('horizontal intent stays locked even when later movement drifts vertically', () => {
  assert.equal(classifyCarouselIntent({ deltaX: 3, deltaY: 30, currentIntent: 'horizontal' }), 'horizontal');
});

test('velocity sampling favors recent movement without discarding the previous sample', () => {
  const velocity = sampleCarouselVelocity({
    previousX: 20,
    previousTime: 100,
    currentX: 30,
    currentTime: 120,
    previousVelocity: .2,
  });
  assert.ok(velocity > .2 && velocity < .5);
});

test('a slow drag advances when distance is sufficient', () => {
  const decision = release({ distanceX: 42, velocityX: .05 });
  assert.equal(decision.action, 'advance');
  assert.equal(decision.direction, -1);
  assert.equal(decision.targetIndex, 2);
});

test('a short deliberate flick advances from release velocity', () => {
  const decision = release({ distanceX: -13, velocityX: -.48 });
  assert.equal(decision.action, 'advance');
  assert.equal(decision.direction, 1);
  assert.equal(decision.targetIndex, 4);
});

test('a short slow drag returns to its starting website', () => {
  const decision = release({ distanceX: 11, velocityX: .08 });
  assert.equal(decision.action, 'return');
  assert.equal(decision.direction, 0);
  assert.equal(decision.targetIndex, 3);
});

test('a very strong long pull still advances only one website', () => {
  const decision = release({ distanceX: -340, velocityX: -2.4 });
  assert.equal(decision.targetIndex, 4);
  assert.equal(Math.abs(decision.direction), 1);
  assert.ok(decision.impulse <= 1);
});

const simulateSpring = ({ currentAngle, targetAngle, angularVelocity }) => {
  const positions = [];
  let state = { currentAngle, targetAngle, angularVelocity, settled: false };
  for (let elapsed = 0; elapsed < 2000 && !state.settled; elapsed += 16) {
    state = { targetAngle, ...stepCarouselSpring({ ...state, deltaMs: 16 }) };
    positions.push(state.currentAngle);
  }
  return { state, positions };
};

test('the release spring visibly overshoots and returns to the selected website', () => {
  const { state, positions } = simulateSpring({ currentAngle: 13, targetAngle: 45, angularVelocity: 145 });
  assert.ok(Math.max(...positions) > 45.5);
  assert.equal(state.currentAngle, 45);
  assert.equal(state.angularVelocity, 0);
  assert.equal(state.settled, true);
});

test('stronger release velocity creates stronger bounded overshoot', () => {
  const mild = simulateSpring({ currentAngle: 13, targetAngle: 45, angularVelocity: 70 });
  const strong = simulateSpring({ currentAngle: 13, targetAngle: 45, angularVelocity: 220 });
  const mildOvershoot = Math.max(...mild.positions) - 45;
  const strongOvershoot = Math.max(...strong.positions) - 45;
  assert.ok(strongOvershoot > mildOvershoot);
  assert.ok(strongOvershoot < 22.5);
});
