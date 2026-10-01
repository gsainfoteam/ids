import { expect } from 'vitest';

export type Point = { x: number; y: number };

type Hug = { side: 'right' | 'left'; runX: number; runY: number; radius: number };

const SUBPIXEL = 0.5;

export const arcOf = (grip: Element) =>
  grip.querySelector<SVGPathElement>('[data-resize-grip-arc]');

export function pointsAlong(path: SVGGeometryElement, segments = 48): Point[] {
  const toPage = path.getScreenCTM()!;
  const length = path.getTotalLength();
  return Array.from({ length: segments + 1 }, (_, index) => {
    const { x, y } = path.getPointAtLength((length * index) / segments);
    return {
      x: toPage.a * x + toPage.c * y + toPage.e,
      y: toPage.b * x + toPage.d * y + toPage.f,
    };
  });
}

export const middleOfTheArc = (grip: Element) => pointsAlong(arcOf(grip)!, 2)[1]!;

export function expectTheArcToHug(grip: Element, { side, runX, runY, radius }: Hug) {
  const inward = side === 'right' ? -1 : 1;
  const center = { x: runX + inward * radius, y: runY - radius };
  const points = pointsAlong(arcOf(grip)!);
  const pastTheCenter = (point: Point) => (point.x - center.x) * -inward > SUBPIXEL;
  const inTheCorner = (point: Point) => pastTheCenter(point) && point.y > center.y + SUBPIXEL;

  for (const point of points) {
    const onTheBottomRun = Math.abs(point.y - runY) < SUBPIXEL && !pastTheCenter(point);
    const onTheEndRun = Math.abs(point.x - runX) < SUBPIXEL && point.y <= center.y + SUBPIXEL;
    const onTheBend =
      Math.abs(Math.hypot(point.x - center.x, point.y - center.y) - radius) < SUBPIXEL;
    expect(onTheBottomRun || onTheEndRun || onTheBend, `${point.x}, ${point.y}`).toBe(true);
  }
  expect(points.filter(inTheCorner).length).toBeGreaterThan(2);
}
