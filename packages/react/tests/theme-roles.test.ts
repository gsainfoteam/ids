import { describe, expect, test } from 'vitest';

import { palettes } from '../.storybook/palettes';
import { resolveColors } from '../src/components/utility/ids-provider/theme-roles';
import { checkIdsTheme } from '../src/components/utility/ids-provider/theme-variables';

import type { IdsPalette } from '../src/components/utility/ids-provider/theme';

describe.each(Object.keys(palettes))('%s', (hue) => {
  const { issues } = resolveColors({ primary: palettes[hue as keyof typeof palettes] });

  test('passes every role rule', () => {
    expect(issues).toEqual([]);
  });
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

  test('reports a palette whose text roles cannot reach their Lc', () => {
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
