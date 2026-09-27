import { clamp } from 'es-toolkit';

function decimalsOf(n: number) {
  const [mantissa, exponent] = String(n).split('e');
  const fraction = mantissa!.split('.')[1]?.length ?? 0;
  return fraction + (exponent == null ? 0 : Math.max(0, -Number(exponent)));
}

export function snap(raw: number, min: number, max: number, step: number) {
  const stepped = Math.round((raw - min) / step) * step + min;
  const decimals = Math.min(100, Math.max(decimalsOf(min), decimalsOf(max), decimalsOf(step)));
  return Number(clamp(stepped, min, max).toFixed(decimals));
}

export function percentOf(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}

export function thumbOffset(percent: number) {
  return `calc(${percent}% + ${0.5 - percent / 100} * var(--slider-thumb))`;
}

export function ratioAlong(distance: number, length: number, thumb: number) {
  const travel = length - thumb;
  if (travel <= 0) return 0;
  return clamp((distance - thumb / 2) / travel, 0, 1);
}

export function closestThumb(values: readonly number[], target: number) {
  let best = 0;
  for (let index = 1; index < values.length; index++) {
    if (Math.abs(values[index]! - target) < Math.abs(values[best]! - target)) best = index;
  }
  const tied = values.filter((value) => value === values[best]).length > 1;
  if (!tied) return { index: best, tied: false };
  const first = values.indexOf(values[best]!);
  const last = values.lastIndexOf(values[best]!);
  if (target < values[best]!) return { index: first, tied: false };
  if (target > values[best]!) return { index: last, tied: false };
  return { index: first, tied: true };
}

export function moveThumb(
  values: readonly number[],
  index: number,
  raw: number,
  { min, max, step, gap }: { min: number; max: number; step: number; gap: number },
) {
  const lower = index > 0 ? values[index - 1]! + gap : min;
  const upper = index < values.length - 1 ? values[index + 1]! - gap : max;
  const next = clamp(snap(raw, min, max, step), lower, upper);
  return values.map((value, position) => (position === index ? next : value));
}

export function stepMarks(min: number, max: number, step: number) {
  const count = Math.floor((max - min) / step + 1e-9) + 1;
  return Array.from({ length: count }, (_, index) => snap(min + index * step, min, max, step));
}
