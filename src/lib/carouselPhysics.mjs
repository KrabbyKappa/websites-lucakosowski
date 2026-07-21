const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const normalizeIndex = (index, itemCount) => (index % itemCount + itemCount) % itemCount;

const nearestAngleForIndex = (index, itemCount, theta, aroundAngle) => {
  const canonical = -normalizeIndex(index, itemCount) * theta;
  return canonical + Math.round((aroundAngle - canonical) / 360) * 360;
};

export const classifyCarouselIntent = ({ deltaX, deltaY, currentIntent = 'pending' }) => {
  if (currentIntent !== 'pending') return currentIntent;

  const horizontal = Math.abs(deltaX);
  const vertical = Math.abs(deltaY);
  if (horizontal >= 2 && horizontal >= vertical * .65) return 'horizontal';
  if (vertical >= 6 && vertical > horizontal * 1.45) return 'vertical';
  return 'pending';
};

export const sampleCarouselVelocity = ({
  previousX,
  previousTime,
  currentX,
  currentTime,
  previousVelocity = 0,
}) => {
  const deltaTime = clamp(currentTime - previousTime, 1, 48);
  const instantaneousVelocity = (currentX - previousX) / deltaTime;
  return previousVelocity * .35 + instantaneousVelocity * .65;
};

export const decideCarouselRelease = ({
  distanceX,
  velocityX,
  originIndex,
  itemCount,
  theta,
  originAngle,
}) => {
  const distance = Math.abs(distanceX);
  const speed = Math.abs(velocityX);
  const advancesByDistance = distance >= 36;
  const advancesByVelocity = distance >= 10 && speed >= .34;
  const advances = advancesByDistance || advancesByVelocity;
  const physicalDirection = Math.sign(distance >= 3 ? distanceX : velocityX);
  const direction = advances && physicalDirection !== 0 ? -physicalDirection : 0;
  const targetIndex = normalizeIndex(originIndex + direction, itemCount);
  const expectedTravelAngle = originAngle - direction * theta;
  const targetAngle = nearestAngleForIndex(targetIndex, itemCount, theta, expectedTravelAngle);
  const distanceImpulse = clamp((distance - 8) / 112, 0, 1);
  const velocityImpulse = clamp((speed - .08) / 1.12, 0, 1);

  return {
    action: direction === 0 ? 'return' : 'advance',
    direction,
    targetIndex,
    targetAngle,
    impulse: clamp(Math.max(distanceImpulse, velocityImpulse), 0, 1),
  };
};

export const stepCarouselSpring = ({ currentAngle, targetAngle, angularVelocity, deltaMs }) => {
  const deltaSeconds = clamp(deltaMs, 0, 32) / 1000;
  const stiffness = 155;
  const damping = 14;
  const acceleration = (targetAngle - currentAngle) * stiffness - angularVelocity * damping;
  const nextVelocity = angularVelocity + acceleration * deltaSeconds;
  const nextAngle = currentAngle + nextVelocity * deltaSeconds;
  const settled = Math.abs(targetAngle - nextAngle) < .05 && Math.abs(nextVelocity) < .6;

  if (settled) return { currentAngle: targetAngle, angularVelocity: 0, settled: true };
  return { currentAngle: nextAngle, angularVelocity: nextVelocity, settled: false };
};
