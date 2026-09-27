import {
  clampRgb,
  converter,
  differenceEuclidean,
  formatCss,
  formatHex,
  formatHex8,
  formatHsl,
  formatRgb,
  modeHsl,
  modeHsv,
  modeOklch,
  modeRgb,
  parse,
  round,
  useMode as registerMode,
  type Rgb,
} from 'culori/fn';

registerMode(modeRgb);
registerMode(modeHsl);
registerMode(modeHsv);
registerMode(modeOklch);

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch';
export type { Rgb };
export type HSVA = { h: number; s: number; v: number; a: number };

const toRgb = converter('rgb');
const toHsv = converter('hsv');
const toOklch = converter('oklch');
const withAlpha = (color: Rgb): Rgb => ({ ...color, alpha: color.alpha ?? 1 });
const distance = differenceEuclidean('rgb', [1, 1, 1, 1]);
const fine = round(4);
const coarse = round(2);

export function parseColor(value: string): Rgb | undefined {
  const color = parse(value.trim());
  return color && clampRgb(toRgb(color));
}

export function parseColorInput(text: string) {
  const trimmed = text.trim();
  return parseColor(
    /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(trimmed) ? `#${trimmed}` : trimmed,
  );
}

export function serializeColor(color: Rgb, format: ColorFormat, alpha: boolean): string {
  const shown: Rgb = { ...color, alpha: alpha ? (color.alpha ?? 1) : undefined };
  if (format === 'hex') return (alpha ? formatHex8(shown) : formatHex(shown)).toUpperCase();
  if (format === 'rgb') return formatRgb(shown);
  if (format === 'hsl') return formatHsl(shown);
  const { l, c, h } = toOklch(shown);
  return formatCss({
    mode: 'oklch',
    l: fine(l),
    c: fine(c),
    h: h === undefined ? undefined : coarse(h),
    alpha: shown.alpha === undefined ? undefined : coarse(shown.alpha),
  });
}

export function rgbaToHsva(color: Rgb, previous?: HSVA): HSVA {
  const { h, s, v } = toHsv(color);
  return {
    h: h ?? previous?.h ?? 0,
    s: v === 0 ? (previous?.s ?? s) : s,
    v,
    a: color.alpha ?? 1,
  };
}

export const hsvaToRgba = ({ h, s, v, a }: HSVA): Rgb => toRgb({ mode: 'hsv', h, s, v, alpha: a });

export const sameColor = (a: Rgb, b: Rgb) => distance(withAlpha(a), withAlpha(b)) < 0.01;

export const cssColor = (color: Rgb) => formatRgb(color);

export function formatPlaceholder(format: ColorFormat, alpha: boolean) {
  if (format === 'hex') return alpha ? '#RRGGBBAA' : '#RRGGBB';
  if (format === 'rgb') return alpha ? 'rgba(0, 0, 0, 1)' : 'rgb(0, 0, 0)';
  if (format === 'hsl') return alpha ? 'hsla(0, 0%, 0%, 1)' : 'hsl(0, 0%, 0%)';
  return alpha ? 'oklch(0 0 0 / 1)' : 'oklch(0 0 0)';
}
