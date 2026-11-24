import { expect, test } from 'vitest';

import { insetClipPath } from '../src/internal/lib/corner-shape';

const box = { width: 200, height: 100 };
const insets = { top: 10, right: 20, bottom: 10, left: 20 };

const pointsOf = (clip: string) =>
  [...clip.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(([, x, y]) => [Number(x), Number(y)]);

test('a round corner stays an inset() the browser draws', () => {
  expect(insetClipPath(box, insets, 8, 2)).toBe('inset(10px 20px 10px 20px round 8px)');
});

test('a squircle corner is a path inside the inset box', () => {
  const clip = insetClipPath(box, insets, 18, 4);

  expect(clip.startsWith("path('M")).toBe(true);
  for (const [x, y] of pointsOf(clip)) {
    expect(x).toBeGreaterThanOrEqual(20);
    expect(x).toBeLessThanOrEqual(180);
    expect(y).toBeGreaterThanOrEqual(10);
    expect(y).toBeLessThanOrEqual(90);
  }
});

test('squircle paths of any radius have the same commands, so a clip-path animates between them', () => {
  const commands = (clip: string) => clip.replace(/-?[\d.]+/g, '0');

  expect(commands(insetClipPath(box, insets, 0, 4))).toBe(
    commands(insetClipPath(box, { top: 0, right: 0, bottom: 0, left: 0 }, 30, 4)),
  );
});

test('a radius past half the inset box is clamped like border-radius', () => {
  const points = pointsOf(insetClipPath(box, insets, 500, 4));

  expect(points[0], 'the radius stops at half the 80px height').toEqual([20 + 40, 10]);
});
