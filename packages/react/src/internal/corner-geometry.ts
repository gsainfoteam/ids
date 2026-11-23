import { ROUND_CORNER_EXPONENT, type PhysicalCorner } from './corner-shape';

function lengthOf(value: string, box: number) {
  const number = parseFloat(value) || 0;
  return value.trim().endsWith('%') ? (number / 100) * box : number;
}

export function cornerRadius(style: CSSStyleDeclaration, corner: PhysicalCorner, box: number) {
  return Math.min(lengthOf(style.getPropertyValue(`border-${corner}-radius`), box), box / 2);
}

export function diagonalInset(radius: number, exponent = ROUND_CORNER_EXPONENT) {
  return radius * (1 - 2 ** (-1 / exponent));
}
