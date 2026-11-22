import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

const css = readFileSync(
  createRequire(import.meta.url).resolve('@gsainfoteam/ids-css/no-fonts.css'),
  'utf8',
);

const isComponentCode = (file: string) =>
  /\.tsx?$/.test(file) && !/\.stories\.tsx?$/.test(file) && !file.startsWith('tokens/');

const componentModules = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter(isComponentCode)
  .sort();

const source = (file: string) => readFileSync(SRC + file, 'utf8');

const matchesIn = (pattern: RegExp) =>
  componentModules.flatMap((file) =>
    [...source(file).matchAll(pattern)].map((match) => `${file}: ${match[0]}`),
  );

const DARK_VARIANT = /(?<![\w-])dark:(?=[\w[(-])/g;
const ROLE_REDEFINED = /\[--[\w-]+:var\(--ids-color-[\w-]+\)\]/g;
const COLOR_MIX = /color-mix\(/g;
const IDS_VARIABLE = /--ids-[a-z0-9-]*[a-z0-9](?![\w$-])/g;
const COLOR_WITH_OPACITY =
  /(?<![\w-])(?:bg|text|border|ring|inset-ring|fill|stroke|outline|shadow|divide|from|via|to|decoration|caret|accent)-([a-z][\w-]*|\(--ids-color-[\w-]+\))\/\d+/g;

const COLORS_OUTSIDE_IDS = new Set(['black', 'white', 'current', 'transparent', 'inherit']);

const FOCUS_HALO = [
  'ring-primary-strong/40',
  'stroke-primary-strong/40',
  'inset-ring-(--ids-color-text-on-primary-solid)/60',
];
const TEXT_SELECTION = ['bg-primary-solid/30', 'bg-primary-solid/15'];
const VEIL_OVER_UNKNOWN_CONTENT = ['bg-base/60', 'bg-base/95'];
const SCROLL_AREA_TRACK = ['bg-neutral-soft/50', 'bg-(--ids-color-border-neutral-strong)/60'];
const EDGE_OVER_UNKNOWN_CONTENT = [
  'inset-ring-(--ids-color-text-neutral-strong)/8',
  'inset-ring-(--ids-color-text-neutral-strong)/10',
  'inset-ring-(--ids-color-text-neutral-strong)/15',
];

const translucentOnPurpose = new Set([
  ...FOCUS_HALO,
  ...TEXT_SELECTION,
  ...VEIL_OVER_UNKNOWN_CONTENT,
  ...SCROLL_AREA_TRACK,
  ...EDGE_OVER_UNKNOWN_CONTENT,
]);

test('component code has no dark: variant, since a component token picks the color per mode', () => {
  expect(matchesIn(DARK_VARIANT)).toEqual([]);
});

test('component code never points a variable of its own at a color role', () => {
  expect(matchesIn(ROLE_REDEFINED)).toEqual([]);
});

test('component code mixes no colors with color-mix', () => {
  expect(matchesIn(COLOR_MIX)).toEqual([]);
});

test('component code fades no IDS color with an opacity modifier, except the translucent layers', () => {
  const faded = componentModules.flatMap((file) =>
    [...source(file).matchAll(COLOR_WITH_OPACITY)]
      .filter(
        ([utility, color]) => !COLORS_OUTSIDE_IDS.has(color!) && !translucentOnPurpose.has(utility),
      )
      .map(([utility]) => `${file}: ${utility}`),
  );

  expect(faded).toEqual([]);
});

test('every --ids-* variable component code names exists in ids.css', () => {
  const missing = componentModules.flatMap((file) =>
    [...new Set(source(file).match(IDS_VARIABLE) ?? [])]
      .filter((name) => !new RegExp(`${name}(?![\\w-])`).test(css))
      .map((name) => `${file}: ${name}`),
  );

  expect(missing).toEqual([]);
});
