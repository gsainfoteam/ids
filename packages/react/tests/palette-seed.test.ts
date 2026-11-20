import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { clampChroma, formatHex } from 'culori/fn';
import { expect, test } from 'vitest';

import palette from '../../core/tokens/palette.json';
import {
  SCALE_RULES,
  createIdsPalette,
} from '../src/components/utility/ids-provider/palette-scales';
import { createIdsRamp, shadeOf } from '../src/components/utility/ids-provider/palette-seed';
import { RAMP_STEPS, type IdsRamp } from '../src/components/utility/ids-provider/theme';
import { resolveColors } from '../src/components/utility/ids-provider/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';
import { IDS_NEUTRAL_SCALES } from '../src/tokens/color-roles';
import { STATUS_PALETTES } from '../src/tokens/palette-model';

const stepsOf = (built: IdsRamp) => RAMP_STEPS.map((step) => built[step]);

const seedAt = (l: number, c: number, h: number) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'));

test('the status palettes are the four in core', () => {
  for (const [name, steps] of Object.entries(STATUS_PALETTES))
    expect(steps).toEqual(
      RAMP_STEPS.map((step) => palette[name as keyof typeof STATUS_PALETTES][step].$value),
    );
});

test.each([
  ['#0d9488', 600],
  ['#fde68a', 300],
  ['#1e3a8a', 900],
  ['#7c3aed', 600],
] as const)('the seed %s lands on the step with the nearest lightness, %s', (seed, step) => {
  const built = createIdsRamp(seed)!;

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

const SWEEP_OF_EVERY_SEED_MS = 30_000;

const COLD_NODE_START_ON_A_BUSY_RUNNER_MS = 30_000;

const HUES = Array.from({ length: 72 }, (_, index) => index * 5);

const everySeed = () =>
  HUES.flatMap((hue) => SEEDS.map(([lightness, chroma]) => seedAt(lightness, chroma, hue)));

test(
  'every seed builds a palette whose roles reach their Lc in both modes',
  { timeout: SWEEP_OF_EVERY_SEED_MS },
  () => {
    const failing = everySeed().flatMap((seed) => {
      const { issues } = resolveColors({ primary: seed, secondary: seed, tertiary: seed });
      return issues.length === 0 ? [] : [`${seed}: ${issues.map((issue) => issue.message)}`];
    });
    expect(failing).toEqual([]);
  },
);

test('every seed builds a palette that runs from light to dark', () => {
  const unordered = everySeed().filter((seed) => {
    const lightness = stepsOf(createIdsRamp(seed)!).map((hex) => shadeOf(hex).l);
    return lightness.some((l, index) => index > 0 && l >= lightness[index - 1]!);
  });
  expect(unordered).toEqual([]);
});

test('a seed builds an 8-step scale for each mode', () => {
  const ramp = createIdsRamp('#2b7fff')!;
  const { light, dark } = createIdsPalette('#2b7fff')!;

  expect([...light, ...dark].every((hex) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true);
  expect(light).toHaveLength(8);
  expect(dark).toHaveLength(8);
  expect([light[1], light[2], light[3], light[4]]).toEqual([ramp[50], ramp[100], ramp[200], ramp[300]]);
});

test('the dark surfaces of a built scale sit at the lightness of the dark neutral', () => {
  const darkSurfaces = SCALE_RULES.dark.surfaces.length;

  for (const seed of everySeed()) {
    const { dark } = createIdsPalette(seed)!;
    dark.slice(0, darkSurfaces).forEach((hex, index) =>
      expect(shadeOf(hex).l, `${seed} step ${index + 1}`).toBeCloseTo(
        shadeOf(IDS_NEUTRAL_SCALES.dark[index]!).l,
        2,
      ),
    );
  }
});

test('a built palette is in 8-bit hex', () => {
  const palette = createIdsRamp('oklch(0.62 0.19 150)')!;
  expect(stepsOf(palette).every((hex) => /^#[0-9a-f]{6}$/.test(hex))).toBe(true);
});

test('a gray seed builds a gray palette, and a bad seed is reported', () => {
  const isGray = (hex: string) =>
    hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7);
  expect(stepsOf(createIdsRamp('#808080')!).every(isGray)).toBe(true);
  expect(createIdsRamp('not a color')).toBeUndefined();
  expect(checkIdsTheme({ primary: 'not a color' })).toEqual([
    { path: 'primary', message: 'primary is not a CSS color: not a color.' },
  ]);
});

test(
  'the built palette module works without the rest of the package, as a tree-shaken app loads it',
  { timeout: COLD_NODE_START_ON_A_BUSY_RUNNER_MS },
  () => {
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
    const { createIdsRamp } = await import('./dist/components/utility/ids-provider/palette-seed.js');
    process.stdout.write(createIdsRamp('#0d9488')?.[600] ?? 'undefined');
  `,
      ],
      { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' },
    );
    expect(result.stdout, result.stderr).toBe('#0d9488');
  },
);
