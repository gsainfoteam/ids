import { describe, expect, test } from 'vitest';

import { palettes } from '../.storybook/palettes';
import { createIdsPalette } from '../src/components/utility/ids-provider/palette-scales';
import {
  resolveColors,
  resolveColorsOnce,
  slotsOf,
} from '../src/components/utility/ids-provider/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';

import type { IdsRamp } from '../src/components/utility/ids-provider/theme';

describe.each(Object.keys(palettes))('%s', (hue) => {
  const { issues } = resolveColors({ primary: palettes[hue as keyof typeof palettes] });

  test('passes every role rule', () => {
    expect(issues).toEqual([]);
  });
});

describe('resolveColorsOnce', () => {
  test('a new theme object with the same colors reuses the resolved roles', () => {
    const first = resolveColorsOnce({ primary: palettes.teal, radius: 8 });

    expect(resolveColorsOnce({ primary: { ...palettes.teal }, cornerShape: 'squircle' })).toBe(
      first,
    );
    expect(resolveColorsOnce({ primary: palettes.teal, neutral: 'tinted' })).not.toBe(first);
  });

  test('a color set pushed out by 64 newer ones is resolved again', () => {
    const first = resolveColorsOnce({ primary: '#3366cc' });
    for (let lightness = 0; lightness < 64; lightness++)
      resolveColorsOnce({ primary: `oklch(${0.3 + lightness / 200} 0.1 250)` });

    expect(resolveColorsOnce({ primary: '#3366cc' })).not.toBe(first);
  });
});

describe('checkIdsTheme', () => {
  test('reports a missing primary and missing steps', () => {
    expect(checkIdsTheme({} as never).map((issue) => issue.path)).toEqual(['primary']);

    const { 500: _, ...withoutFiveHundred } = palettes.blue;
    expect(
      checkIdsTheme({ primary: withoutFiveHundred as IdsRamp }).map((issue) => issue.path),
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

  test('reports a palette whose text roles cannot reach their Lc', () => {
    const washedOut = Object.fromEntries(
      Object.keys(palettes.blue).map((step) => [step, '#9ca3af']),
    ) as unknown as IdsRamp;

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

  test('reports a scale that is not 9 colors, and a step that is not a color', () => {
    const { light, dark } = createIdsPalette('#2b7fff')!;

    expect(
      checkIdsTheme({ primary: { light: light.slice(0, 8) as never, dark } }).map(
        (issue) => issue.path,
      ),
    ).toEqual(['primary.light']);
    expect(
      checkIdsTheme({ primary: { light, dark: [...dark.slice(0, 8), 'bluish'] as never } }),
    ).toEqual([{ path: 'primary.dark.9', message: 'Step 9 is not a CSS color: bluish.' }]);
  });

  test('accepts any CSS color for a step', () => {
    expect(
      checkIdsTheme({ primary: { ...palettes.blue, 600: 'oklch(0.546 0.245 262.9)' } }),
    ).toEqual([]);
  });
});

describe('a palette given as light and dark scales', () => {
  const given = createIdsPalette('#2b7fff')!;
  const { colors, issues } = resolveColors({ primary: given });

  test('is used as it is, each role reading its step', () => {
    expect(issues).toEqual([]);
    expect(colors!.palettes.primary).toEqual(given);
    for (const mode of ['light', 'dark'] as const) {
      expect(colors!.roles[mode]['bg-primary-soft']).toBe(given[mode][3]);
      expect(colors!.roles[mode]['border-primary']).toBe(given[mode][4]);
      expect(colors!.roles[mode]['border-primary-strong']).toBe(given[mode][5]);
      expect(colors!.roles[mode]['bg-primary-solid']).toBe(given[mode][6]);
      expect(colors!.roles[mode]['text-primary']).toBe(given[mode][7]);
      expect(colors!.roles[mode]['text-primary-strong']).toBe(given[mode][8]);
    }
  });

  test('gives the same primary roles as the color it was built from', () => {
    const fromSeed = resolveColors({ primary: '#2b7fff' }).colors!.roles;
    for (const mode of ['light', 'dark'] as const)
      for (const role of slotsOf('primary'))
        expect(colors!.roles[mode][role], `${mode} ${role}`).toBe(fromSeed[mode][role]);
  });
});
