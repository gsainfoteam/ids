import { compile } from '@tailwindcss/node';
import { transform } from 'lightningcss';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { buildIr } from '../src/ir/build.ts';
import { loadSources } from '../src/sources/load.ts';
import { outputOf } from '../src/targets/output.ts';

const root = new URL('../', import.meta.url);

const UTILITIES_THE_STYLESHEET_DECLARES = [
  'focus-ring',
  'focus-ring-scheme',
  'focus-ring-current',
  'focus-ring-visible:ring-2',
  'state-layer',
  'state-hover',
  'state-press',
  'state-scheme',
  'state-fill',
  'font-mono',
  'shimmer',
  'document-text',
  'rounded-full',
  'rounded-standard',
  'animate-marquee',
  'animate-skeleton-wave',
  'dark:bg-base',
  'bg-scheme-solid',
  'text-on-scheme-solid',
  'shadow-surface',
  'bg-control-outline',
  'text-body-b1-regular',
  'tracking-snug',
  'leading-b2',
  'p-4',
];

async function compiledStylesheet() {
  const ir = buildIr(await loadSources(root));
  const stylesheet = outputOf(root, ir, 'css', 'stylesheet');
  const compiler = await compile(
    ['@import "tailwindcss";', `@import ${JSON.stringify(stylesheet.path)};`].join('\n'),
    { base: fileURLToPath(root), onDependency: () => {} },
  );
  return {
    ir,
    css: compiler.build([
      ...UTILITIES_THE_STYLESHEET_DECLARES,
      ...ir.color.scheme.utilities.map((utility) => utility.name.css.identifier),
      ...ir.css.concentric.pads.map((pad) => pad.className),
    ]),
  };
}

describe('the stylesheet', () => {
  test('compiles with Tailwind to the CSS that is committed', async () => {
    const { css } = await compiledStylesheet();

    await expect(css).toMatchFileSnapshot('__snapshots__/ids.compiled.css');
  });

  test('compiles to CSS that Lightning CSS reads without a warning', async () => {
    const { css } = await compiledStylesheet();
    const result = transform({ filename: 'ids.css', code: Buffer.from(css), errorRecovery: true });

    expect(result.warnings).toEqual([]);
  });

  test('spells a text style part as a sub-property of the style', async () => {
    const { ir } = await compiledStylesheet();
    const [style] = ir.typography.textStyles;
    const weight = style?.parts.find((part) => part.part === 'fontWeight');

    expect(style?.variable.css.customProperty).toBe('--ids-text-headline-h1-bold');
    expect(weight?.variable.css.customProperty).toBe('--ids-text-headline-h1-bold--font-weight');
    expect(weight?.tailwind[0]?.css.themeProperty).toBe('--text-headline-h1-bold--font-weight');
    expect(weight?.variable.ts.member).toBe('textHeadlineH1BoldFontWeight');
  });
});
