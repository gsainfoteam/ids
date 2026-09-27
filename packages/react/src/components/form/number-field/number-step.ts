type Decimal = { digits: bigint; scale: number };

// A JS number written out as integer digits over a power of ten, so 0.1 is exactly 1/10 and
// step arithmetic never picks up binary noise such as 0.1 + 0.2 = 0.30000000000000004.
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

/** Move the decimal point without multiplication/division rounding artifacts. */
export function shiftDecimal(value: number, places: number): number {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  return Number(`${mantissa}e${Number(exponent) + places}`);
}

/** Add the decimal representations of JS numbers without introducing 0.1 + 0.2 noise. */
export function addDecimal(left: number, right: number): number {
  const a = toDecimal(left);
  const b = toDecimal(right);
  const scale = Math.max(a.scale, b.scale);
  return fromDigits(atScale(a, scale) + atScale(b, scale), scale);
}

export function clampNumber(value: number, min?: number, max?: number) {
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));
}

export function isOnStep(value: number, step: number, base: number) {
  const v = toDecimal(value);
  const s = toDecimal(step);
  const b = toDecimal(base);
  const scale = Math.max(v.scale, s.scale, b.scale);
  return (atScale(v, scale) - atScale(b, scale)) % atScale(s, scale) === 0n;
}

export type SnapMode = 'nearest' | 'up' | 'down';

// The grid is base + k * step. `up` and `down` find the next grid value strictly above or below,
// which is what an arrow key does from a value typed off the grid.
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

// Clamping can land on a bound that is not on the grid, such as max 10 with step 3 from 0; the
// nearest grid value inside the range is used instead.
export function clampToStep(value: number, step: number, base: number, min?: number, max?: number) {
  let next = snapToStep(value, step, base, 'nearest');
  if (max !== undefined && next > max) next = snapToStep(max, step, base, 'nearest');
  if (max !== undefined && next > max) next = snapToStep(max, step, base, 'down');
  if (min !== undefined && next < min) next = snapToStep(min, step, base, 'nearest');
  if (min !== undefined && next < min) next = snapToStep(min, step, base, 'up');
  return clampNumber(next, min, max);
}
