import { clamp } from 'es-toolkit';

import { Decimal } from '../../../internal/decimal';

export function shiftDecimal(value: number, places: number): number {
  return new Decimal(value).times(Decimal.pow(10, places)).toNumber();
}

export function addDecimal(left: number, right: number): number {
  return new Decimal(left).plus(right).toNumber();
}

export function isOnStep(value: number, step: number, base: number) {
  return new Decimal(value).minus(base).mod(step).isZero();
}

export type SnapMode = 'nearest' | 'up' | 'down';

function offsetOnGrid(offset: Decimal, step: number, mode: SnapMode) {
  if (mode === 'nearest') return offset.toNearest(step, Decimal.ROUND_HALF_CEIL);

  const onGrid = offset.mod(step).isZero();

  if (mode === 'up') return onGrid ? offset.plus(step) : offset.toNearest(step, Decimal.ROUND_CEIL);
  return onGrid ? offset.minus(step) : offset.toNearest(step, Decimal.ROUND_FLOOR);
}

export function snapToStep(value: number, step: number, base: number, mode: SnapMode) {
  const offset = new Decimal(value).minus(base);

  return offsetOnGrid(offset, step, mode).plus(base).toNumber();
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
