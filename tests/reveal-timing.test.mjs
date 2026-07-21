import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getHeadingRevealProgress,
  getProcessRevealTimes,
  getProcessStepProgress,
  splitSemanticSentences,
} from '../src/lib/revealTiming.mjs';

test('phone headings begin later than desktop headings', () => {
  const geometry = { top: 650, height: 100, viewportHeight: 1000 };
  assert.equal(getHeadingRevealProgress({ ...geometry, isMobile: false }), 1);
  assert.equal(getHeadingRevealProgress({ ...geometry, isMobile: true }), .3);
});

test('reduced motion makes headings immediately readable', () => {
  assert.equal(getHeadingRevealProgress({
    top: 1000,
    height: 100,
    viewportHeight: 800,
    isMobile: true,
    reducedMotion: true,
  }), 1);
});

test('each process step is revealed from its own viewport position', () => {
  const first = getProcessStepProgress({
    top: 420,
    viewportHeight: 844,
    isMobile: true,
    stepIndex: 0,
  });
  const later = getProcessStepProgress({
    top: 700,
    viewportHeight: 844,
    isMobile: true,
    stepIndex: 3,
  });
  assert.ok(first > .6);
  assert.equal(later, 0);
});

test('Review and launch is still early in its reveal when it first becomes comfortably visible', () => {
  const progress = getProcessStepProgress({
    top: 545,
    viewportHeight: 844,
    isMobile: true,
    stepIndex: 3,
  });
  assert.ok(progress > 0);
  assert.ok(progress < .2);
});

test('desktop steps sharing a row still receive an ordered stagger', () => {
  const first = getProcessStepProgress({
    top: 600,
    viewportHeight: 1000,
    isMobile: false,
    stepIndex: 0,
  });
  const second = getProcessStepProgress({
    top: 600,
    viewportHeight: 1000,
    isMobile: false,
    stepIndex: 1,
  });
  assert.ok(first > second);
  assert.ok(first - second >= .05);
});

test('semantic process copy is split into complete sentence units', () => {
  assert.deepEqual(
    splitSemanticSentences('You review the complete result before it goes live. After launch, wording can improve.'),
    [
      'You review the complete result before it goes live.',
      'After launch, wording can improve.',
    ],
  );
});

test('heading, first sentence, and second sentence reveal one after another', () => {
  const early = getProcessRevealTimes({ progress: .22, sentenceCount: 2 });
  assert.ok(early.headingTime > 0);
  assert.ok(early.sentenceTimes[0] > 0);
  assert.equal(early.sentenceTimes[1], 0);

  const later = getProcessRevealTimes({ progress: .58, sentenceCount: 2 });
  assert.equal(later.headingTime, 650);
  assert.ok(later.sentenceTimes[0] > later.sentenceTimes[1]);
  assert.ok(later.sentenceTimes[1] > 0);
});

test('all process reveal units finish exactly at full progress', () => {
  assert.deepEqual(getProcessRevealTimes({ progress: 1, sentenceCount: 2 }), {
    headingTime: 650,
    sentenceTimes: [650, 650],
  });
});
