import Big from 'big.js';
import { clamp } from 'es-toolkit';

export function shiftDecimal(value: number, places: number): number {
  return new Big(value).times(new Big(10).pow(places)).toNumber();
}

export function addDecimal(left: number, right: number): number {
  return new Big(left).plus(right).toNumber();
}

export function isOnStep(value: number, step: number, base: number) {
  return new Big(value).minus(base).mod(step).eq(0);
}

function stepsBelow(value: number, step: number, base: number) {
  const offset = new Big(value).minus(base);
  const size = new Big(step);

  const signedRest = offset.mod(size);
  const rest = signedRest.lt(0) ? signedRest.plus(size) : signedRest;

  return { floor: offset.minus(rest).div(size), rest, size };
}

export type SnapMode = 'nearest' | 'up' | 'down';

export function snapToStep(value: number, step: number, base: number, mode: SnapMode) {
  const { floor, rest, size } = stepsBelow(value, step, base);

  const onGrid = rest.eq(0);
  const pastHalf = rest.times(2).gte(size);

  const count =
    mode === 'up'
      ? floor.plus(1)
      : mode === 'down'
        ? onGrid
          ? floor.minus(1)
          : floor
        : pastHalf
          ? floor.plus(1)
          : floor;

  return new Big(base).plus(count.times(size)).toNumber();
}

function gridValueAtOrBelow(bound: number, step: number, base: number) {
  const nearest = snapToStep(bound, step, base, 'nearest');
  return nearest > bound ? snapToStep(bound, step, base, 'down') : nearest;
}

function gridValueAtOrAbove(bound: number, step: number, base: number) {
  const nearest = snapToStep(bound, step, base, 'nearest');
  return nearest < bound ? snapToStep(bound, step, base, 'up') : nearest;
}

export function clampToStep(value: number, step: number, base: number, min?: number, max?: number) {
  let next = snapToStep(value, step, base, 'nearest');
  if (max !== undefined && next > max) next = gridValueAtOrBelow(max, step, base);
  if (min !== undefined && next < min) next = gridValueAtOrAbove(min, step, base);
  return clamp(next, min ?? -Infinity, max ?? Infinity);
}
