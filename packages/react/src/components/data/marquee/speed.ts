import type { MarqueeSpeed } from '.';

type NamedSpeed = Exclude<MarqueeSpeed, number>;

export const PIXELS_PER_SECOND = {
  slow: 25,
  normal: 50,
  fast: 100,
} as const satisfies Record<NamedSpeed, number>;

export const LENGTH_ASSUMED_BEFORE_MEASURING = 1000;

export const isValidSpeed = (speed: MarqueeSpeed) =>
  typeof speed === 'string' || (Number.isFinite(speed) && speed > 0);

export function pixelsPerSecond(speed: MarqueeSpeed) {
  if (typeof speed === 'string') return PIXELS_PER_SECOND[speed];
  return isValidSpeed(speed) ? speed : PIXELS_PER_SECOND.normal;
}

export function loopDuration(length: number | undefined, speed: MarqueeSpeed) {
  const milliseconds =
    ((length ?? LENGTH_ASSUMED_BEFORE_MEASURING) / pixelsPerSecond(speed)) * 1000;
  return `${Math.round(milliseconds)}ms`;
}
