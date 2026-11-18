import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import { lightnessContrast } from '../src/components/utility/ids-provider/contrast';
import {
  ACCENT_TEXT_LC,
  FILL_LAYER,
  MARK_LC,
  TEXT_LC,
  MODES,
  neutralRoles,
  resolveColors,
  slotsOf,
  contentLayer,
  tintLayer,
  underStateLayers,
  type StateLayer,
} from '../src/components/utility/ids-provider/theme-roles';
import {
  IDS_BRAND_FAMILIES,
  IDS_COLOR_FAMILIES,
  IDS_NEUTRAL_PALETTE,
  IDS_NEUTRAL_STEPS,
  IDS_STATUS_FAMILIES,
} from '../src/tokens/color-roles';

import type { IdsNeutral, IdsStatus } from '../src/components/utility/ids-provider/theme';
import type { IdsMode } from '../src/tokens/types';

const resolveCss = (entry: string) => createRequire(import.meta.url).resolve(entry);

const css = readFileSync(resolveCss('@gsainfoteam/ids-css/no-fonts.css'), 'utf8');

const modeBlock = (mode: IdsMode) =>
  css.match(new RegExp(`\\[data-mode="${mode}"\\] \\{([^}]*)\\}`))?.[1] ?? '';

const mappedSlots = (mode: IdsMode) =>
  Object.fromEntries(
    [...modeBlock(mode).matchAll(/--ids-color-([\w-]+): var\((.+)\);/g)].map(([, slot, value]) => [
      slot!,
      value!,
    ]),
  );

const themeVar = (mode: IdsMode, slot: string) => `--ids-theme-${mode}-${slot}`;

type Roles = { [slot: string]: string };

type LayersOf = (roles: Roles, text: string) => StateLayer[];

type Pair = { foreground: string; backgrounds: string[]; lc: number; layers: LayersOf };

const noLayer: LayersOf = () => [];

const fillLayer: LayersOf = () => [FILL_LAYER];

const textLayer: LayersOf = (_, text) => [contentLayer(text)];

const textAndFamilyLayers =
  (family: string): LayersOf =>
  (roles, text) => [contentLayer(text), tintLayer(roles[`bg-${family}`]!)];

const pair = (foreground: string, backgrounds: string[], lc: number, layers: LayersOf): Pair => ({
  foreground,
  backgrounds,
  lc,
  layers,
});

const LAYERS = ['bg-neutral-subtlest', 'bg-neutral-subtler'];

const pairsFor = (family: string): Pair[] => {
  if (family === 'neutral')
    return [
      pair('text-on-neutral', ['bg-neutral'], TEXT_LC, noLayer),
      pair('text-on-neutral-subtler', ['bg-neutral-subtler'], TEXT_LC, textLayer),
      pair('text-on-neutral-subtle', ['bg-neutral-subtle'], TEXT_LC, textLayer),
      pair('text-on-neutral-subtlest', ['bg-neutral-subtlest'], TEXT_LC, textLayer),
      pair('text-on-neutral-bold', ['bg-neutral-bold'], TEXT_LC, fillLayer),
      pair('text-neutral-bold', [...LAYERS, 'bg-neutral-subtle'], TEXT_LC, textLayer),
      pair('text-neutral', [...LAYERS, 'bg-neutral-subtle'], TEXT_LC, noLayer),
    ];

  const familyLayers = textAndFamilyLayers(family);

  return [
    pair(`text-on-${family}`, [`bg-${family}`], TEXT_LC, fillLayer),
    pair(`text-on-${family}-subtler`, [`bg-${family}-subtler`], TEXT_LC, familyLayers),
    pair(`text-on-${family}-subtle`, [`bg-${family}-subtle`], TEXT_LC, familyLayers),
    pair(
      `text-${family}`,
      [...LAYERS, `bg-${family}-subtler`, `bg-${family}-subtle`],
      ACCENT_TEXT_LC,
      familyLayers,
    ),
    pair(`border-${family}`, ['bg-neutral-subtlest'], MARK_LC, noLayer),
  ];
};

const lowestContrast = (roles: Roles, { foreground, backgrounds, layers }: Pair) => {
  const text = roles[foreground]!;
  const states = backgrounds.flatMap((background) =>
    underStateLayers(roles[background]!, layers(roles, text)),
  );
  return Math.min(...states.map((state) => lightnessContrast(text, state)));
};

const failingPairs = (roles: Roles) =>
  IDS_COLOR_FAMILIES.flatMap(pairsFor)
    .filter((checked) => lowestContrast(roles, checked) < checked.lc)
    .map(
      (checked) =>
        `${checked.foreground} on ${checked.backgrounds.join(' / ')} below Lc ${checked.lc}: ${lowestContrast(roles, checked).toFixed(1)}`,
    );

test.each(MODES)('ids.css maps every %s slot from the provider variables', (mode) => {
  const mapped = mappedSlots(mode);
  const expected = IDS_COLOR_FAMILIES.flatMap(slotsOf);

  expect(Object.keys(mapped).sort()).toEqual([...expected].sort());
  for (const slot of expected) expect(mapped[slot]!.startsWith(themeVar(mode, slot))).toBe(true);
});

test.each(MODES)(
  'ids.css has no %s brand fallback, since the provider writes every family',
  (mode) => {
    const mapped = mappedSlots(mode);

    for (const family of IDS_BRAND_FAMILIES)
      for (const slot of slotsOf(family)) expect(mapped[slot]).toBe(themeVar(mode, slot));
  },
);

test.each(MODES)('ids.css falls back to the pure %s neutral without a provider value', (mode) => {
  const mapped = mappedSlots(mode);

  for (const [slot, step] of Object.entries(IDS_NEUTRAL_STEPS[mode]))
    expect(mapped[slot]).toBe(
      `${themeVar(mode, slot)}, ${IDS_NEUTRAL_PALETTE[String(step) as keyof typeof IDS_NEUTRAL_PALETTE]}`,
    );
});

test.each(MODES)('the pure %s neutral fallback reaches its Lc', (mode) => {
  const roles = neutralRoles({ ...IDS_NEUTRAL_PALETTE }, mode);

  for (const checked of pairsFor('neutral'))
    expect(lowestContrast(roles, checked), checked.foreground).toBeGreaterThanOrEqual(checked.lc);
});

test('ids.css emits no shared color namespace and no chart colors', () => {
  expect(css).not.toMatch(/--color-(primary|secondary|danger|neutral|surface)\b/);
  expect(css).not.toMatch(/--ids-color-[\w-]*-(hover|active|soft)\b/);
  expect(css).not.toMatch(/--ids-color-chart-/);
  expect(css).not.toMatch(/data-color/);
});

test('every utility namespace reads a family role', () => {
  for (const family of [...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES, 'neutral']) {
    expect(css).toContain(
      `--background-color-${family}-subtle: var(--ids-color-bg-${family}-subtle);`,
    );
    expect(css).toContain(
      `--text-color-on-${family}-subtle: var(--ids-color-text-on-${family}-subtle);`,
    );
    expect(css).toContain(`--border-color-${family}: var(--ids-color-border-${family});`);
    expect(css).toContain(`--ring-color-${family}: var(--ids-color-border-${family});`);
  }
});

test('ids.css reads the scale from the provider and rounds without a fallback', () => {
  expect(css).not.toMatch(/--ids-scale:\s*[\d.]+;/);
  expect(css).not.toMatch(/@supports \(width: round/);
  expect(css).toMatch(
    /--ids-size-control-standard: round\(calc\(36px \* var\(--ids-scale, 1\)\), 1px\);/,
  );
});

test('the default entry loads the fonts, and no-fonts.css is the tokens alone', () => {
  const entry = resolveCss('@gsainfoteam/ids-css');
  const imports = [...readFileSync(entry, 'utf8').matchAll(/@import '([^']+)'/g)].map(
    ([, path]) => new URL(path, `file://${entry}`).pathname,
  );

  expect(imports).toEqual([
    new URL('fonts/fonts.css', `file://${entry}`).pathname,
    resolveCss('@gsainfoteam/ids-css/no-fonts.css'),
  ]);
  expect(css).not.toMatch(/@font-face/);
});

const neutrals: IdsNeutral[] = ['pure', 'tinted'];

test.each(MODES)(
  'every family × slot reaches its Lc with all three brands given in %s',
  (mode) => {
    for (const hue of paletteHues) {
      const { colors, issues } = resolveColors({
        primary: palettes[hue],
        secondary: palettes[paletteHues[(paletteHues.indexOf(hue) + 4) % paletteHues.length]!],
        tertiary: palettes[paletteHues[(paletteHues.indexOf(hue) + 8) % paletteHues.length]!],
      });

      expect(issues, hue).toEqual([]);
      expect(failingPairs(colors!.roles[mode]), hue).toEqual([]);
    }
  },
);

test.each(MODES)('a %s line is the color of the text beside it', (mode) => {
  for (const hue of paletteHues) {
    const roles = resolveColors({ primary: palettes[hue] }).colors!.roles[mode];

    for (const family of [...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES])
      expect(roles[`border-${family}`], `${hue} ${family}`).toBe(roles[`text-${family}`]);
  }
});

const statuses: IdsStatus[] = ['harmonized', 'fixed'];

describe.each(MODES)('%s', (mode) => {
  describe.each(neutrals)('%s neutral', (neutral) => {
    describe.each(statuses)('%s status', (status) => {
      test.each(paletteHues)(
        'every family × slot reaches its Lc with %s and the brands derived from it',
        (hue) => {
          const { colors, issues } = resolveColors({ primary: palettes[hue], neutral, status });

          expect(issues).toEqual([]);
          expect(failingPairs(colors!.roles[mode])).toEqual([]);
        },
      );
    });
  });
});
