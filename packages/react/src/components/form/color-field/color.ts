export type ColorFormat = 'hex' | 'rgb' | 'hsl';
export type RGBA = { r: number; g: number; b: number; a: number };
export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export function hsvToRgb(h: number, s: number, v: number, a = 1): RGBA {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c;
  const channels =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return {
    r: Math.round((channels[0] + m) * 255),
    g: Math.round((channels[1] + m) * 255),
    b: Math.round((channels[2] + m) * 255),
    a,
  };
}
export function rgbToHsv({ r, g, b }: RGBA) {
  const rr = r / 255,
    gg = g / 255,
    bb = b / 255,
    max = Math.max(rr, gg, bb),
    min = Math.min(rr, gg, bb),
    d = max - min;
  const h =
    d === 0
      ? 0
      : 60 *
        (max === rr ? ((gg - bb) / d + 6) % 6 : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4);
  return { h, s: max === 0 ? 0 : d / max, v: max };
}
export function parseColor(value: string): RGBA | null {
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value.trim());
  if (hex) {
    let text = hex[1];
    if (text.length <= 4) text = [...text].map((c) => c + c).join('');
    return {
      r: parseInt(text.slice(0, 2), 16),
      g: parseInt(text.slice(2, 4), 16),
      b: parseInt(text.slice(4, 6), 16),
      a: text.length === 8 ? parseInt(text.slice(6, 8), 16) / 255 : 1,
    };
  }
  const fn = /^(rgb|rgba|hsl|hsla)\(\s*([^)]*)\s*\)$/i.exec(value.trim());
  if (!fn) return null;
  const tokens = fn[2].split(/\s*,\s*|\s*\/\s*|\s+/).filter(Boolean);
  if (tokens.length !== 3 && tokens.length !== 4) return null;
  if (!tokens.every((t) => /^[+-]?(?:\d+\.?\d*|\.\d+)%?$/.test(t))) return null;
  const n = tokens.map(parseFloat);
  if (!n.every(Number.isFinite)) return null;
  const a = tokens[3] === undefined ? 1 : clamp(n[3] / (tokens[3].endsWith('%') ? 100 : 1));
  if (fn[1].toLowerCase().startsWith('rgb'))
    return {
      r: Math.round(clamp(n[0] / (tokens[0].endsWith('%') ? 100 : 255)) * 255),
      g: Math.round(clamp(n[1] / (tokens[1].endsWith('%') ? 100 : 255)) * 255),
      b: Math.round(clamp(n[2] / (tokens[2].endsWith('%') ? 100 : 255)) * 255),
      a,
    };
  if (!tokens[1].endsWith('%') || !tokens[2].endsWith('%')) return null;
  const h = ((n[0] % 360) + 360) % 360,
    s = clamp(n[1] / 100),
    l = clamp(n[2] / 100),
    v = l + s * Math.min(l, 1 - l);
  return hsvToRgb(h, v === 0 ? 0 : 2 * (1 - l / v), v, a);
}
export function serializeColor(color: RGBA, format: ColorFormat, alpha: boolean): string {
  const { r, g, b } = color,
    a = Math.round(clamp(color.a) * 1000) / 1000;
  if (format === 'hex')
    return (
      '#' +
      [r, g, b, ...(alpha ? [Math.round(color.a * 255)] : [])]
        .map((n) => Math.round(n).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    );
  if (format === 'rgb') return alpha ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  const { h, s, v } = rgbToHsv(color),
    l = v * (1 - s / 2),
    sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  const content = `${Math.round(h)}, ${Math.round(sl * 100)}%, ${Math.round(l * 100)}%`;
  return alpha ? `hsla(${content}, ${a})` : `hsl(${content})`;
}
