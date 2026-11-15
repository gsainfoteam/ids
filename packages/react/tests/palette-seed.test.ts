import { clampChroma, differenceEuclidean, formatHex } from 'culori/fn';
import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import {
  createIdsPalette,
  hueOf,
  paletteAtHue,
  shadeOf,
} from '../src/components/utility/ids-provider/palette-seed';
import { PALETTE_STEPS, type IdsPalette } from '../src/components/utility/ids-provider/theme';
import { resolveColors } from '../src/components/utility/ids-provider/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';
import { STATUS_PALETTES } from '../src/tokens/palette-model';

const stepsOf = (palette: IdsPalette) => PALETTE_STEPS.map((step) => palette[step]);

const oklabDistance = differenceEuclidean('oklab');

const DELTA_E_SCALE = 100;

const FULL_CHROMA = 1;

const TOLERANCE = { mean: 3, max: 6.5 };

const distancesFrom = (built: IdsPalette, reference: IdsPalette) =>
  PALETTE_STEPS.map((step) => oklabDistance(built[step], reference[step]) * DELTA_E_SCALE);

const summary = (distances: number[]) => ({
  mean: distances.reduce((sum, distance) => sum + distance) / distances.length,
  max: Math.max(...distances),
});

const seedAt = (l: number, c: number, h: number) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'));

test('the status palettes are the four in core', () => {
  for (const [name, steps] of Object.entries(STATUS_PALETTES))
    expect(steps).toEqual(stepsOf(palettes[name as keyof typeof STATUS_PALETTES]));
});

describe('the model reproduces each core palette', () => {
  test.each(paletteHues)('%s at its own hue and full chroma', (hue) => {
    const { mean, max } = summary(
      distancesFrom(paletteAtHue(hueOf(palettes[hue]), FULL_CHROMA), palettes[hue]),
    );

    expect(mean).toBeLessThan(TOLERANCE.mean);
    expect(max).toBeLessThan(TOLERANCE.max);
  });

  test.each(paletteHues)('%s from its step 500, which it keeps exactly', (hue) => {
    const built = createIdsPalette(palettes[hue][500])!;
    const { mean, max } = summary(distancesFrom(built, palettes[hue]));

    expect(built[500]).toBe(palettes[hue][500]);
    expect(mean).toBeLessThan(TOLERANCE.mean);
    expect(max).toBeLessThan(TOLERANCE.max);
  });
});

test.each([
  ['#0d9488', 600],
  ['#fde68a', 300],
  ['#1e3a8a', 900],
  ['#7c3aed', 600],
] as const)('the seed %s lands on the step with the nearest lightness, %s', (seed, step) => {
  const built = createIdsPalette(seed)!;

  expect(built[step]).toBe(seed);
  expect(stepsOf(built).filter((hex) => hex === seed)).toHaveLength(1);
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

const everySeed = () =>
  HUES.flatMap((hue) => SEEDS.map(([lightness, chroma]) => seedAt(lightness, chroma, hue)));

test('every seed builds a palette whose roles reach their Lc in both modes', () => {
  const failing = everySeed().flatMap((seed) => {
    const { issues } = resolveColors({ primary: seed, secondary: seed, tertiary: seed });
    return issues.length === 0 ? [] : [`${seed}: ${issues.map((issue) => issue.message)}`];
  });
  expect(failing).toEqual([]);
});

test('every seed builds a palette that runs from light to dark', () => {
  const unordered = everySeed().filter((seed) => {
    const lightness = stepsOf(createIdsPalette(seed)!).map((hex) => shadeOf(hex).l);
    return lightness.some((l, index) => index > 0 && l >= lightness[index - 1]!);
  });
  expect(unordered).toEqual([]);
});

test('a built palette is in 8-bit hex', () => {
  const palette = createIdsPalette('oklch(0.62 0.19 150)')!;
  expect(stepsOf(palette).every((hex) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true);
});

test('a gray seed builds a gray palette, and a bad seed is reported', () => {
  const isGray = (hex: string) =>
    hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);
  expect(stepsOf(createIdsPalette('#808080')!).every(isGray)).toBe(true);
  expect(createIdsPalette('not a color')).toBeUndefined();
  expect(checkIdsTheme({ primary: 'not a color' })).toEqual([
    { path: 'primary', message: 'primary is not a CSS color: not a color.' },
  ]);
});
