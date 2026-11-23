import { ROUND_CORNER_EXPONENT, type PhysicalCorner } from './corner-shape';

export type Radius = { x: number; y: number };
export type CornerRadii = Record<PhysicalCorner, Radius>;

const CORNERS: PhysicalCorner[] = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

function lengthOf(value: string, box: number) {
  const number = parseFloat(value) || 0;
  return value.trim().endsWith('%') ? (number / 100) * box : number;
}

export function cornerRadius(style: CSSStyleDeclaration, corner: PhysicalCorner, box: number) {
  return Math.min(lengthOf(style.getPropertyValue(`border-${corner}-radius`), box), box / 2);
}

function radiusOf(value: string, width: number, height: number): Radius {
  const [horizontal = '0', vertical = horizontal] = value.trim().split(/\s+/);
  return { x: lengthOf(horizontal, width), y: lengthOf(vertical, height) };
}

function shareOf(side: number, radii: number) {
  return radii > side ? side / radii : 1;
}

export function cornerRadii(style: CSSStyleDeclaration, width: number, height: number) {
  const radii = Object.fromEntries(
    CORNERS.map((corner) => [
      corner,
      radiusOf(style.getPropertyValue(`border-${corner}-radius`), width, height),
    ]),
  ) as CornerRadii;

  const fit = Math.min(
    shareOf(width, radii['top-left'].x + radii['top-right'].x),
    shareOf(width, radii['bottom-left'].x + radii['bottom-right'].x),
    shareOf(height, radii['top-left'].y + radii['bottom-left'].y),
    shareOf(height, radii['top-right'].y + radii['bottom-right'].y),
  );

  return Object.fromEntries(
    CORNERS.map((corner) => [corner, { x: radii[corner].x * fit, y: radii[corner].y * fit }]),
  ) as CornerRadii;
}

export function diagonalInset(radius: number, exponent = ROUND_CORNER_EXPONENT) {
  return radius * (1 - 2 ** (-1 / exponent));
}
