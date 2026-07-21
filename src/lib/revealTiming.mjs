const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const getHeadingRevealProgress = ({
  top,
  height,
  viewportHeight,
  isMobile = false,
  reducedMotion = false,
}) => {
  if (reducedMotion) return 1;
  const triggerLine = viewportHeight * (isMobile ? .68 : .8);
  return clamp01((triggerLine - top) / Math.max(1, height));
};

export const getProcessStepProgress = ({
  top,
  viewportHeight,
  isMobile = false,
  stepIndex = 0,
  reducedMotion = false,
}) => {
  if (reducedMotion) return 1;
  const startLine = viewportHeight * (isMobile ? .72 : .82);
  const finishLine = viewportHeight * (isMobile ? .38 : .44);
  const rawProgress = clamp01((startLine - top) / Math.max(1, startLine - finishLine));
  const orderDelay = Math.max(0, stepIndex) * (isMobile ? .03 : .12);
  return clamp01((rawProgress - orderDelay) / Math.max(.01, 1 - orderDelay));
};

export const splitSemanticSentences = (text) => {
  const normalized = String(text || '').trim().replace(/\s+/g, ' ');
  if (!normalized) return [];
  return normalized.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean);
};

export const getProcessRevealTimes = ({ progress, sentenceCount }) => {
  const duration = 650;
  const revealTime = (start, window) => clamp01((progress - start) / window) * duration;
  return {
    headingTime: revealTime(0, .5),
    sentenceTimes: Array.from(
      { length: Math.max(0, sentenceCount) },
      (_, index) => revealTime(.18 + index * .24, .55),
    ),
  };
};
