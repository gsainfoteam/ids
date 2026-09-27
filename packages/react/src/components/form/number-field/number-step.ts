import { clamp } from 'es-toolkit';

type Decimal = { digits: bigint; scale: number };

function toDecimal(value: number): Decimal {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  const fraction = mantissa.split('.')[1]?.length ?? 0;
  return { digits: BigInt(mantissa.replace('.', '')), scale: fraction - Number(exponent) };
}

function atScale({ digits, scale }: Decimal, target: number) {
  return digits * 10n ** BigInt(target - scale);
}

function fromDigits(digits: bigint, scale: number) {
  return Number(`${digits}e${-scale}`);
}

function floorDiv(a: bigint, b: bigint) {
  const quotient = a / b;
  return a % b !== 0n && a < 0n !== b < 0n ? quotient - 1n : quotient;
}

export function shiftDecimal(value: number, places: number): number {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

export function addDecimal(left: number, right: number): number {
  const a = toDecimal(left);
  const b = toDecimal(right);
  const scale = Math.max(a.scale, b.scale);
  return fromDigits(atScale(a, scale) + atScale(b, scale), scale);
}

export function isOnStep(value: number, step: number, base: number) {
  const v = toDecimal(value);
  const s = toDecimal(step);
  const b = toDecimal(base);
  const scale = Math.max(v.scale, s.scale, b.scale);
  return (atScale(v, scale) - atScale(b, scale)) % atScale(s, scale) === 0n;
}

export type SnapMode = 'nearest' | 'up' | 'down';

export function snapToStep(value: number, step: number, base: number, mode: SnapMode) {
  const v = toDecimal(value);
  const s = toDecimal(step);
  const b = toDecimal(base);
  const scale = Math.max(v.scale, s.scale, b.scale);
  const offset = atScale(v, scale) - atScale(b, scale);
  const size = atScale(s, scale);
  const floor = floorDiv(offset, size);
  const rest = offset - floor * size;
  const k =
    mode === 'up'
      ? floor + 1n
      : mode === 'down'
        ? rest === 0n
          ? floor - 1n
          : floor
        : rest * 2n >= size
          ? floor + 1n
          : floor;
  return fromDigits(atScale(b, scale) + k * size, scale);
}

export function clampToStep(value: number, step: number, base: number, min?: number, max?: number) {
  let next = snapToStep(value, step, base, 'nearest');
  if (max !== undefined && next > max) next = snapToStep(max, step, base, 'nearest');
  if (max !== undefined && next > max) next = snapToStep(max, step, base, 'down');
  if (min !== undefined && next < min) next = snapToStep(min, step, base, 'nearest');
  if (min !== undefined && next < min) next = snapToStep(min, step, base, 'up');
  return clamp(next, min ?? -Infinity, max ?? Infinity);
}
