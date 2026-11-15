import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { neutralShades, palettes } from '../.storybook/palettes';
import { resolveColors } from '../src/components/utility/ids-provider/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';

import type { IdsPalette } from '../src/components/utility/ids-provider/theme';
import type { IdsMode } from '../src/tokens/types';

const modes: IdsMode[] = ['light', 'dark'];

const readTokens = (file: string) =>
  JSON.parse(readFileSync(new URL(`../../core/tokens/semantic/${file}`, import.meta.url), 'utf8'));

const shadeOf = (reference: string) => {
  const [, palette, step] = reference.match(/^\{(\w+)\.(\d+)\}$/)!;
  const shades: { [step: string]: string } =
    palette === 'neutral' ? neutralShades : palettes[palette as keyof typeof palettes];
  return shades[step!]!.toLowerCase();
};

const slotOfTheDartName = {
  primary: 'bg-primary',
  'on-primary': 'text-on-primary',
  secondary: 'bg-primary-soft',
  'on-secondary': 'text-on-primary-soft',
  accent: 'text-primary',
} as const;

const dartRoles = (hue: string, mode: IdsMode) => {
  const { color } = readTokens(`${hue}.${mode}.json`) as {
    color: { [role: string]: { $value: string } };
  };
  return Object.fromEntries(
    Object.entries(slotOfTheDartName).map(([name, slot]) => [slot, shadeOf(color[name]!.$value)]),
  );
};

describe.each(Object.keys(palettes))('%s', (hue) => {
  const { colors, issues } = resolveColors({ primary: palettes[hue as keyof typeof palettes] });

  test('passes every role rule', () => {
    expect(issues).toEqual([]);
  });

  test.each(modes)('picks the steps the %s Dart table holds', (mode) => {
    const roles = colors!.roles[mode];
    const picked = Object.fromEntries(
      Object.values(slotOfTheDartName).map((slot) => [slot, roles[slot]]),
    );

    expect(picked).toEqual(dartRoles(hue, mode));
  });
});

test('the Dart table keeps the old names, outline included', () => {
  expect(Object.keys(readTokens('blue.light.json').color).sort()).toEqual(
    [...Object.keys(slotOfTheDartName), 'outline'].sort(),
  );
});

describe('checkIdsTheme', () => {
  test('reports a missing primary and missing steps', () => {
    expect(checkIdsTheme({} as never).map((issue) => issue.path)).toEqual(['primary']);

    const { 500: _, ...withoutFiveHundred } = palettes.blue;
    expect(
      checkIdsTheme({ primary: withoutFiveHundred as IdsPalette }).map((issue) => issue.path),
    ).toEqual(['primary.500']);
  });

  test('reports a step that is not a color', () => {
    expect(checkIdsTheme({ primary: { ...palettes.blue, 600: 'bluish' } })).toEqual([
      { path: 'primary.600', message: 'Step 600 is not a CSS color: bluish.' },
    ]);
  });

  test('reports a color string that is not a color', () => {
    expect(checkIdsTheme({ primary: palettes.blue, secondary: 'bluish' })).toEqual([
      { path: 'secondary', message: 'secondary is not a CSS color: bluish.' },
    ]);
  });

  test('reports a palette whose text roles cannot reach AA', () => {
    const washedOut = Object.fromEntries(
      Object.keys(palettes.blue).map((step) => [step, '#9ca3af']),
    ) as unknown as IdsPalette;

    expect(checkIdsTheme({ primary: washedOut }).length).toBeGreaterThan(0);
  });

  test('reports an unknown neutral and status', () => {
    expect(
      checkIdsTheme({
        primary: palettes.blue,
        neutral: 'warm' as never,
        status: { error: '#dc2626' } as never,
      }).map((issue) => issue.path),
    ).toEqual(['neutral', 'status.error']);
  });

  test('reports radius, corner shape and scale outside their range', () => {
    expect(
      checkIdsTheme({
        primary: palettes.blue,
        radius: 40,
        cornerShape: 'bevel' as never,
        scale: 3,
      }).map((issue) => issue.path),
    ).toEqual(['radius', 'cornerShape', 'scale']);
    expect(checkIdsTheme({ primary: palettes.blue, scale: 0.875 })).toEqual([]);
  });

  test('accepts any CSS color for a step', () => {
    expect(
      checkIdsTheme({ primary: { ...palettes.blue, 600: 'oklch(0.546 0.245 262.9)' } }),
    ).toEqual([]);
  });
});
