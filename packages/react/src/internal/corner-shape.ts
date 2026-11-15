export type PhysicalCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export const ROUND_CORNER_EXPONENT = 2;

const CURVATURE_OF_KEYWORD: { [shape: string]: number } = { round: 1, squircle: 2 };

function curvatureOf(shape: string) {
  const superellipse = shape.match(/^superellipse\(([\d.]+)\)$/);
  return superellipse ? Number(superellipse[1]) : CURVATURE_OF_KEYWORD[shape];
}

export function cornerExponent(style: CSSStyleDeclaration, corner: PhysicalCorner) {
  const curvature = curvatureOf(style.getPropertyValue(`corner-${corner}-shape`).trim());
  return curvature !== undefined && curvature >= 1 ? 2 ** curvature : ROUND_CORNER_EXPONENT;
}
