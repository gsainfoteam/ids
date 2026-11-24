import { clamp } from 'es-toolkit';

import { cornerRadius, diagonalInset } from '../../../../internal/lib/corner-geometry';
import {
  ROUND_CORNER_EXPONENT,
  cornerExponent,
  type PhysicalCorner,
} from '../../../../internal/lib/corner-shape';

export type Axis = 'x' | 'y';
export type Placement = 'start' | 'end';

export type Corners = {
  topStart: number;
  topEnd: number;
  bottomStart: number;
  bottomEnd: number;
};

export type Shape = {
  rtl: boolean;
  gap: number;
  thickness: number;
  width: number;
  height: number;
  corners: Corners;
  exponent: number;
};

export type ThumbLayout = { size: number; offset: number; travel: number };

export const MIN_THUMB_LENGTH = 20;
export const PAGE_FRACTION = 0.875;
export const NO_THUMB: ThumbLayout = { size: 0, offset: 0, travel: 0 };

function innerRadius(
  style: CSSStyleDeclaration,
  corner: PhysicalCorner,
  borderA: string,
  borderB: string,
  box: number,
) {
  const border = Math.max(parseFloat(borderA) || 0, parseFloat(borderB) || 0);
  return Math.max(0, cornerRadius(style, corner, box) - border);
}

export function readShape(root: HTMLElement): Shape {
  const style = root.ownerDocument.defaultView!.getComputedStyle(root);
  const width = root.clientWidth;
  const height = root.clientHeight;
  const box = Math.min(width, height);

  const topLeft = innerRadius(style, 'top-left', style.borderTopWidth, style.borderLeftWidth, box);
  const topRight = innerRadius(
    style,
    'top-right',
    style.borderTopWidth,
    style.borderRightWidth,
    box,
  );
  const bottomLeft = innerRadius(
    style,
    'bottom-left',
    style.borderBottomWidth,
    style.borderLeftWidth,
    box,
  );
  const bottomRight = innerRadius(
    style,
    'bottom-right',
    style.borderBottomWidth,
    style.borderRightWidth,
    box,
  );

  const rtl = style.direction === 'rtl';

  return {
    rtl,
    gap: parseFloat(style.getPropertyValue('--scroll-area-gap')) || 0,
    thickness: parseFloat(style.getPropertyValue('--scroll-area-thickness')) || 0,
    width,
    height,
    corners: rtl
      ? { topStart: topRight, topEnd: topLeft, bottomStart: bottomRight, bottomEnd: bottomLeft }
      : { topStart: topLeft, topEnd: topRight, bottomStart: bottomLeft, bottomEnd: bottomRight },
    exponent: cornerExponent(style, 'top-left'),
  };
}

export function clearOfCurve(radius: number, gap: number, exponent = ROUND_CORNER_EXPONENT) {
  if (radius <= gap) return gap;
  const alongTheEdge = radius * (1 - ((radius - gap) / radius) ** exponent) ** (1 / exponent);
  return gap + radius - alongTheEdge;
}

export function cornerSquareFits(radius: number, gap: number, exponent = ROUND_CORNER_EXPONENT) {
  return diagonalInset(radius, exponent) <= gap;
}

export function edgeInset(radius: number, shape: Shape, takenAtThisEnd: number) {
  return Math.max(clearOfCurve(radius, shape.gap, shape.exponent), takenAtThisEnd);
}

export function thumbAlong(
  track: number,
  client: number,
  content: number,
  scrolled: number,
): ThumbLayout {
  const range = content - client;
  if (range <= 0 || track <= 0) return NO_THUMB;

  const size = clamp((track * client) / content, Math.min(MIN_THUMB_LENGTH, track), track);
  const travel = track - size;

  return { size, offset: travel * clamp(scrolled / range, 0, 1), travel };
}

export function barCorners(axis: Axis, placement: Placement, corners: Corners) {
  if (axis === 'y')
    return placement === 'end'
      ? { start: corners.topEnd, end: corners.bottomEnd }
      : { start: corners.topStart, end: corners.bottomStart };

  return placement === 'end'
    ? { start: corners.bottomStart, end: corners.bottomEnd }
    : { start: corners.topStart, end: corners.topEnd };
}

export function meetingCorner(vertical: Placement, horizontal: Placement, corners: Corners) {
  if (horizontal === 'end') return vertical === 'end' ? corners.bottomEnd : corners.bottomStart;
  return vertical === 'end' ? corners.topEnd : corners.topStart;
}
