import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { wcagContrast } from 'culori';
import { describe, expect, test } from 'vitest';

import type { IdsColor, IdsMode } from '../src/tokens/types';

const everyColor = {
  red: true,
  orange: true,
  amber: true,
  yellow: true,
  lime: true,
  green: true,
  emerald: true,
  teal: true,
  cyan: true,
  sky: true,
  blue: true,
  indigo: true,
  violet: true,
  purple: true,
  fuchsia: true,
  pink: true,
  rose: true,
} satisfies Record<IdsColor, true>;

const colors = Object.keys(everyColor) as IdsColor[];
const modes: IdsMode[] = ['light', 'dark'];

const AA_TEXT = 4.5;

const css = readFileSync(createRequire(import.meta.url).resolve('@gsainfoteam/ids-css'), 'utf8');

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

const brandTokens = (color: IdsColor, mode: IdsMode) =>
  tokensFor(`[data-color="${color}"][data-mode="${mode}"]`);

const modeTokens = (mode: IdsMode) => tokensFor(`[data-mode="${mode}"]`);

const contrast = (tokens: { [token: string]: string }, foreground: string, background: string) => {
  const fg = tokens[foreground];
  const bg = tokens[background];
  expect(fg, foreground).toMatch(/^#/);
  expect(bg, background).toMatch(/^#/);
  return wcagContrast(fg!, bg!);
};

test('ids.css themes exactly the IdsColor values', () => {
  const themed = new Set(
    rules.flatMap(({ selector }) => selector.match(/data-color="([a-z]+)"/)?.slice(1) ?? []),
  );

  expect([...themed].sort()).toEqual([...colors].sort());
});

describe.each(modes)('%s brand pairs', (mode) => {
  test.each(colors)('%s on-primary on primary reaches AA', (color) => {
    expect(contrast(brandTokens(color, mode), 'on-primary', 'primary')).toBeGreaterThanOrEqual(
      AA_TEXT,
    );
  });

  test.each(colors)('%s on-secondary on secondary reaches AA', (color) => {
    expect(contrast(brandTokens(color, mode), 'on-secondary', 'secondary')).toBeGreaterThanOrEqual(
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
