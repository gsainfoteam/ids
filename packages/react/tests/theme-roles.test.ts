import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { neutralShades, palettes } from '../.storybook/palettes';
import { BRAND_ROLES, type IdsPalette } from '../src/components/utility/ids-provider/theme';
import {
  NEUTRAL_SURFACE,
  SOFT_TINTS,
  resolveThemeRoles,
} from '../src/components/utility/ids-provider/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';

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

const tableRoles = (hue: string, mode: IdsMode) => {
  const { color } = readTokens(`${hue}.${mode}.json`) as {
    color: { [role: string]: { $value: string } };
  };
  return Object.fromEntries(
    Object.entries(color).map(([role, token]) => [role, shadeOf(token.$value)]),
  );
};

const controlSurface = readFileSync(
  new URL('../src/internal/control-surface.ts', import.meta.url),
  'utf8',
);

describe.each(Object.keys(palettes))('%s', (hue) => {
  const { roles, issues } = resolveThemeRoles(palettes[hue as keyof typeof palettes]);

  test('passes every role rule', () => {
    expect(issues).toEqual([]);
  });

  test.each(modes)('reproduces the %s role table', (mode) => {
    expect(roles![mode]).toEqual(tableRoles(hue, mode));
  });
});

test('the role list matches the semantic files', () => {
  expect(Object.keys(tableRoles('blue', 'light')).sort()).toEqual([...BRAND_ROLES].sort());
});

test('the soft tints match the hover and press of control-surface', () => {
  const tints = [
    ...controlSurface.matchAll(
      /\[--control-soft-(?:hover|press):color-mix\(in_oklab,var\(--control-soft\),var\(--control-fill\)_(\d+)%\)\]/g,
    ),
  ].map(([, percent]) => Number(percent) / 100);

  expect(tints).toEqual([...SOFT_TINTS]);
});

test('the surface the accent is checked on matches the neutral tokens', () => {
  for (const mode of modes)
    expect(shadeOf(readTokens(`neutral.${mode}.json`).color.surface.$value)).toBe(
      NEUTRAL_SURFACE[mode],
    );
});

describe('checkIdsTheme', () => {
  test('reports a missing palette and missing steps', () => {
    expect(checkIdsTheme({} as never).map((issue) => issue.path)).toEqual(['palette']);

    const { 500: _, ...withoutFiveHundred } = palettes.blue;
    expect(
      checkIdsTheme({ palette: withoutFiveHundred as IdsPalette }).map((issue) => issue.path),
    ).toEqual(['palette.500']);
  });

  test('reports a step that is not a color', () => {
    expect(checkIdsTheme({ palette: { ...palettes.blue, 600: 'bluish' } })).toEqual([
      { path: 'palette.600', message: 'Step 600 is not a CSS color: bluish.' },
    ]);
  });

  test('reports a palette whose text roles cannot reach AA', () => {
    const washedOut = Object.fromEntries(
      Object.keys(palettes.blue).map((step) => [step, '#9ca3af']),
    ) as unknown as IdsPalette;

    expect(checkIdsTheme({ palette: washedOut }).length).toBeGreaterThan(0);
  });

  test('reports radius, corner shape and scale outside their range', () => {
    expect(
      checkIdsTheme({
        palette: palettes.blue,
        radius: 40,
        cornerShape: 'bevel' as never,
        scale: 3,
      }).map((issue) => issue.path),
    ).toEqual(['radius', 'cornerShape', 'scale']);
    expect(checkIdsTheme({ palette: palettes.blue, scale: 0.875 })).toEqual([]);
  });

  test('accepts any CSS color for a step', () => {
    expect(
      checkIdsTheme({ palette: { ...palettes.blue, 600: 'oklch(0.546 0.245 262.9)' } }),
    ).toEqual([]);
  });
});
