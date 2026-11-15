export type PhysicalCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const ROUND_CORNER_EXPONENT = 2;

export function cornerRadiusScale(style: CSSStyleDeclaration) {
  return Number.parseFloat(style.getPropertyValue('--ids-corner-radius-scale')) || 1;
}

const CURVATURE_OF_KEYWORD: { [shape: string]: number } = { round: 1, squircle: 2 };

function curvatureOf(shape: string) {
  const superellipse = shape.match(/^superellipse\(([\d.]+)\)$/);
  return superellipse ? Number(superellipse[1]) : CURVATURE_OF_KEYWORD[shape];
}

export function cornerExponent(style: CSSStyleDeclaration, corner: PhysicalCorner) {
  const curvature = curvatureOf(style.getPropertyValue(`corner-${corner}-shape`).trim());
  return curvature !== undefined && curvature >= 1 ? 2 ** curvature : ROUND_CORNER_EXPONENT;
}

const SUPERELLIPSE_SEGMENTS = 16;

export function superellipseQuarter(exponent: number) {
  return Array.from({ length: SUPERELLIPSE_SEGMENTS + 1 }, (_, index) => {
    const angle = (Math.PI / 2) * (1 - index / SUPERELLIPSE_SEGMENTS);
    return [Math.cos(angle) ** (2 / exponent), Math.sin(angle) ** (2 / exponent)] as const;
  });
}

export type Insets = { top: number; right: number; bottom: number; left: number };

type Size = { width: number; height: number };

const hundredths = (value: number) => Math.round(value * 100) / 100;

export function insetClipPath(size: Size, insets: Insets, radius: number, exponent: number) {
  const { top, right, bottom, left } = insets;
  if (exponent === ROUND_CORNER_EXPONENT)
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`;

  const x0 = left;
  const y0 = top;
  const x1 = size.width - right;
  const y1 = size.height - bottom;
  const r = Math.max(0, Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2));
  const quarter = superellipseQuarter(exponent);
  const around = (cx: number, cy: number, at: (u: number, v: number) => readonly [number, number]) =>
    quarter
      .map(([u, v]) => {
        const [dx, dy] = at(u, v);
        return `L${hundredths(cx + r * dx)} ${hundredths(cy + r * dy)}`;
      })
      .join('');

  return `path('M${hundredths(x0 + r)} ${hundredths(y0)}${around(x1 - r, y0 + r, (u, v) => [u, -v])}${around(x1 - r, y1 - r, (u, v) => [v, u])}${around(x0 + r, y1 - r, (u, v) => [-u, v])}${around(x0 + r, y0 + r, (u, v) => [-v, -u])}Z')`;
}
