import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import { lightnessContrast } from '../src/components/utility/ids-provider/contrast';
import {
  ACCENT_TEXT_LC,
  MARK_LC,
  TEXT_LC,
  MODES,
  neutralRoles,
  resolveColors,
} from '../src/components/utility/ids-provider/theme-roles';
import {
  IDS_BASE_SLOTS,
  IDS_BRAND_FAMILIES,
  IDS_COLOR_FAMILIES,
  IDS_FAMILY_SLOTS,
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

const slotsOf = (family: string) =>
  IDS_FAMILY_SLOTS.map((template) => template.replace('{family}', family));

const themeVar = (mode: IdsMode, slot: string) => `--ids-theme-${mode}-${slot}`;

const atLeast = (foreground: string, backgrounds: string[], lc: number) =>
  Math.min(...backgrounds.map((background) => lightnessContrast(foreground, background))) >= lc;

const pairsFor = (family: string) => {
  const [bg, bgHover, bgActive, soft, softHover, softActive, onFill, onSoft, text, border] =
    slotsOf(family) as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ];

  return {
    text: [
      [onFill, family === 'neutral' ? [bg] : [bg, bgHover, bgActive]],
      [onSoft, [soft, softHover, softActive]],
      ...(family === 'neutral' ? [[text, ['surface', soft]]] : []),
    ] as [string, string[]][],
    accent: family === 'neutral' ? [] : ([[text, ['surface', soft]]] as [string, string[]][]),
    mark: family === 'neutral' ? [] : ([[border, ['surface']]] as [string, string[]][]),
  };
};

const failingPairs = (roles: { [slot: string]: string }) => {
  const failures: string[] = [];
  const check = (foreground: string, backgrounds: string[], lc: number) => {
    const values = backgrounds.map((background) => roles[background]!);
    if (!atLeast(roles[foreground]!, values, lc))
      failures.push(`${foreground} on ${backgrounds.join(' / ')} below Lc ${lc}`);
  };

  check('on-surface', ['surface'], TEXT_LC);
  for (const family of IDS_COLOR_FAMILIES) {
    const { text, accent, mark } = pairsFor(family);
    for (const [foreground, backgrounds] of text) check(foreground, backgrounds, TEXT_LC);
    for (const [foreground, backgrounds] of accent) check(foreground, backgrounds, ACCENT_TEXT_LC);
    for (const [foreground, backgrounds] of mark) check(foreground, backgrounds, MARK_LC);
  }

  return failures;
};

test.each(MODES)('ids.css maps every %s slot from the provider variables', (mode) => {
  const mapped = mappedSlots(mode);
  const expected = [...IDS_BASE_SLOTS, ...IDS_COLOR_FAMILIES.flatMap(slotsOf)];

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
  const { text } = pairsFor('neutral');

  expect(atLeast(roles['on-surface']!, [roles['surface']!], TEXT_LC)).toBe(true);
  for (const [foreground, backgrounds] of text)
    expect(
      atLeast(
        roles[foreground]!,
        backgrounds.map((background) => roles[background]!),
        TEXT_LC,
      ),
      foreground,
    ).toBe(true);
});

test('ids.css emits no shared color namespace and no chart colors', () => {
  expect(css).not.toMatch(/--color-(primary|secondary|danger|neutral|surface)\b/);
  expect(css).not.toMatch(/--ids-color-chart-/);
  expect(css).not.toMatch(/data-color/);
});

test('every utility namespace reads a family role', () => {
  for (const family of [...IDS_BRAND_FAMILIES, ...IDS_STATUS_FAMILIES, 'neutral']) {
    expect(css).toContain(`--background-color-${family}-soft: var(--ids-color-bg-${family}-soft);`);
    expect(css).toContain(
      `--text-color-on-${family}-soft: var(--ids-color-text-on-${family}-soft);`,
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
