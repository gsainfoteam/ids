import { clampChroma, differenceEuclidean, formatHex } from 'culori/fn';
import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import {
  createIdsPalette,
  paletteFromSeed,
  referencesFrom,
} from '../src/components/utility/ids-provider/palette-seed';
import { REFERENCE_PALETTES } from '../src/components/utility/ids-provider/reference-palettes';
import { PALETTE_STEPS, type IdsPalette } from '../src/components/utility/ids-provider/theme';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';

const stepsOf = (palette: IdsPalette) => PALETTE_STEPS.map((step) => palette[step]);

const oklabDistance = differenceEuclidean('oklab');

const DELTA_E_SCALE = 100;

const seedAt = (l: number, c: number, h: number) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'));

test('the reference table is the 17 palettes in core', () => {
  expect(REFERENCE_PALETTES).toEqual(paletteHues.map((hue) => stepsOf(palettes[hue])));
});

test.each(paletteHues)('the %s step 500 rebuilds %s exactly', (hue) => {
  expect(createIdsPalette(palettes[hue][500])).toEqual(palettes[hue]);
});

describe('leave one out: a palette rebuilt from its neighbours', () => {
  test.each(paletteHues)('%s', (hue) => {
    const others = paletteHues.filter((other) => other !== hue);
    const references = referencesFrom(others.map((other) => stepsOf(palettes[other])));
    const rebuilt = paletteFromSeed(palettes[hue][500], references)!;
    const distances = PALETTE_STEPS.map(
      (step) => oklabDistance(rebuilt[step], palettes[hue][step]) * DELTA_E_SCALE,
    );
    const mean = distances.reduce((sum, distance) => sum + distance) / distances.length;

    expect(mean).toBeLessThan(5);
    expect(Math.max(...distances)).toBeLessThan(10);
  });
});

const SEEDS: [lightness: number, chroma: number][] = [
  [0.6, 0.25],
  [0.55, 0.2],
  [0.7, 0.15],
  [0.45, 0.1],
  [0.8, 0.1],
  [0.6, 0.04],
  [0.9, 0.05],
  [0.3, 0.08],
  [0.65, 0.3],
  [0.95, 0.02],
  [0.2, 0.05],
];

const HUES = Array.from({ length: 72 }, (_, index) => index * 5);

test('every seed builds a palette whose roles reach 4.5:1 in both modes', () => {
  const failing = HUES.flatMap((hue) =>
    SEEDS.flatMap(([lightness, chroma]) => {
      const seed = seedAt(lightness, chroma, hue);
      const issues = checkIdsTheme({ palette: seed });
      return issues.length === 0 ? [] : [`${seed}: ${issues.map((issue) => issue.message)}`];
    }),
  );
  expect(failing).toEqual([]);
});

test('a built palette runs from light to dark in 8-bit hex', () => {
  const palette = createIdsPalette('oklch(0.62 0.19 150)')!;
  const lightness = stepsOf(palette).map((hex) => differenceEuclidean('oklab')(hex, '#000000'));

  expect(stepsOf(palette).every((hex) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true);
  expect(lightness).toEqual([...lightness].sort((a, b) => b - a));
});

test('a gray seed builds a gray palette, and a bad seed is reported', () => {
  const isGray = (hex: string) =>
    hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);
  expect(stepsOf(createIdsPalette('#808080')!).every(isGray)).toBe(true);
  expect(createIdsPalette('not a color')).toBeUndefined();
  expect(checkIdsTheme({ palette: 'not a color' })).toEqual([
    { path: 'palette', message: 'The palette is not a CSS color: not a color.' },
  ]);
});
