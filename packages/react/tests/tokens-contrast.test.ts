import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { differenceCiede2000, interpolate, wcagContrast } from 'culori';
import { describe, expect, test } from 'vitest';

import { paletteHues, palettes } from '../.storybook/palettes';
import { BRAND_ROLES } from '../src/components/utility/ids-provider/theme';
import { resolveThemeRoles } from '../src/components/utility/ids-provider/theme-roles';

import type { IdsMode } from '../src/tokens/types';

const modes: IdsMode[] = ['light', 'dark'];

const AA_TEXT = 4.5;
const AA_GRAPHICS = 3;
const NEIGHBOURING_SERIES_DIFFERENCE = 25;

const css = readFileSync(createRequire(import.meta.url).resolve('@gsainfoteam/ids-css'), 'utf8');

const controlSurface = readFileSync(
  new URL('../src/internal/control-surface.ts', import.meta.url),
  'utf8',
);

const softTints = [
  ...controlSurface.matchAll(
    /\[--control-soft-(hover|press):color-mix\(in_oklab,var\(--control-soft\),var\(--control-fill\)_(\d+)%\)\]/g,
  ),
].map(([, state, percent]) => ({ state: state!, amount: Number(percent) / 100 }));

const rules = [...css.matchAll(/^(\[data-[^{]+?)\s*\{([^}]*)\}/gm)].map(([, selector, body]) => ({
  selector: selector!,
  values: Object.fromEntries(
    [...body!.matchAll(/--ids-color-([\w-]+):\s*(#[0-9a-f]{6});/g)].map(([, name, value]) => [
      name!,
      value!,
    ]),
  ),
}));

const tokensFor = (selector: string) =>
  Object.assign({}, ...rules.filter((rule) => rule.selector === selector).map((r) => r.values)) as {
    [token: string]: string;
  };

const brandTokens = (hue: keyof typeof palettes, mode: IdsMode) =>
  resolveThemeRoles(palettes[hue]).roles![mode] as { [token: string]: string };

const modeTokens = (mode: IdsMode) => tokensFor(`[data-mode="${mode}"]`);

const contrast = (tokens: { [token: string]: string }, foreground: string, background: string) => {
  const fg = tokens[foreground];
  const bg = tokens[background];
  expect(fg, foreground).toMatch(/^#/);
  expect(bg, background).toMatch(/^#/);
  return wcagContrast(fg!, bg!);
};

test.each(modes)('ids.css maps the %s brand roles from the provider variables', (mode) => {
  const mapping = css.match(
    new RegExp(`\\[data-mode="${mode}"\\] \\{([^}]*--ids-theme-[^}]*)\\}`),
  )?.[1];

  expect(
    [...(mapping ?? '').matchAll(/--ids-color-([\w-]+): var\(--ids-theme-(\w+)-([\w-]+)\);/g)].map(
      ([, role, from, fromRole]) => [role, from, fromRole],
    ),
  ).toEqual(BRAND_ROLES.map((role) => [role, mode, role]));
});

test('ids.css reads the scale from the provider and rounds without a fallback', () => {
  expect(css).not.toMatch(/--ids-scale:\s*[\d.]+;/);
  expect(css).not.toMatch(/@supports \(width: round/);
  expect(css).toMatch(/--ids-size-control-standard: round\(calc\(36px \* var\(--ids-scale, 1\)\), 1px\);/);
});

test('ids.css no longer themes by color name', () => {
  expect(css).not.toMatch(/data-color/);
});

describe.each(modes)('%s brand pairs', (mode) => {
  test.each(paletteHues)('%s on-primary on primary reaches AA', (color) => {
    expect(contrast(brandTokens(color, mode), 'on-primary', 'primary')).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  test.each(paletteHues)('%s on-secondary on secondary reaches AA', (color) => {
    expect(contrast(brandTokens(color, mode), 'on-secondary', 'secondary')).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });
});

test('control-surface tints soft controls on hover and press', () => {
  expect(softTints.map(({ state }) => state)).toEqual(['hover', 'press']);
});

describe.each(modes)('%s accent and soft tints', (mode) => {
  test.each(paletteHues)('%s accent reaches AA on surface and on secondary', (color) => {
    const tokens = { ...modeTokens(mode), ...brandTokens(color, mode) };

    expect(contrast(tokens, 'accent', 'surface')).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(tokens, 'accent', 'secondary')).toBeGreaterThanOrEqual(AA_TEXT);
  });

  test.each(paletteHues)('%s on-secondary stays AA on the hover and press tints', (color) => {
    const tokens = brandTokens(color, mode);
    const towardPrimary = interpolate([tokens.secondary!, tokens.primary!], 'oklab');

    for (const { amount } of softTints)
      expect(wcagContrast(tokens['on-secondary']!, towardPrimary(amount))).toBeGreaterThanOrEqual(
        AA_TEXT,
      );
  });
});

describe.each(modes)('%s status pairs', (mode) => {
  const statuses = ['success', 'warning', 'danger', 'info'];

  test.each(statuses)('on-%s on its fill reaches AA', (status) => {
    expect(contrast(modeTokens(mode), `on-${status}`, status)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  test.each(statuses)('%s-strong on surface reaches AA', (status) => {
    expect(contrast(modeTokens(mode), `${status}-strong`, 'surface')).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });
});

describe.each(modes)('%s chart series', (mode) => {
  const series = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
  const difference = differenceCiede2000();

  test.each(series)('%s reaches AA for graphics on surface', (token) => {
    expect(contrast(modeTokens(mode), token, 'surface')).toBeGreaterThanOrEqual(AA_GRAPHICS);
  });

  test.each(series.slice(0, -1).map((token, index) => [token, series[index + 1]!]))(
    '%s and %s stay apart',
    (token, next) => {
      const tokens = modeTokens(mode);

      expect(difference(tokens[token]!, tokens[next]!)).toBeGreaterThanOrEqual(
        NEIGHBOURING_SERIES_DIFFERENCE,
      );
    },
  );
});
