import * as React from 'react';

import { transform } from '@babel/standalone';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import { testTheme } from './theme';
import { liveImports, resolveLiveImport } from '../.storybook/live-imports';
import { liveModuleFrom } from '../.storybook/live-module';
import { IdsProvider } from '../src';

const storySources = import.meta.glob<string>('../src/components/**/*.stories.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

type Located = { node: { start: number; end: number } };
type Declarator = { node: { id: { name?: string }; init?: { start: number; end: number } } };

function usageSourceIn(file: string) {
  let found: string | undefined;
  const findUsage = () => ({
    visitor: {
      VariableDeclarator(path: Declarator & Located) {
        const { id, init } = path.node;
        if (id.name === 'Usage' && init) found = file.slice(init.start, init.end);
      },
    },
  });
  transform(file, {
    filename: 'story.tsx',
    code: false,
    plugins: ['syntax-jsx', ['syntax-typescript', { isTSX: true }], findUsage],
  });
  return found;
}

const THE_EDITOR_ADDS_REACT = "import * as React from 'react';";

function evaluate(module: string) {
  const { code } = transform(`${THE_EDITOR_ADDS_REACT}${module}`, {
    filename: 'index.tsx',
    presets: ['typescript', 'react'],
    plugins: ['transform-modules-commonjs'],
  });
  const imports: Record<string, unknown> = { react: React, ...liveImports };
  const exports: { default?: React.ComponentType } = {};
  new Function('require', 'exports', code!)((id: string) => imports[id], exports);
  return exports.default!;
}

const usages = Object.entries(storySources).flatMap(([path, file]) => {
  const usage = usageSourceIn(file);
  return usage ? [{ path: path.replace('../src/', ''), usage }] : [];
});

describe('a Usage story becomes the live code its Docs page starts from', () => {
  test.for(usages)('$path', ({ usage }, context) => {
    const module = liveModuleFrom(usage, resolveLiveImport);
    if (!module)
      context.skip(
        'Usage reads a name that is not from react, IDS or heroicons, so the Docs page starts from the Playground',
      );

    const Example = evaluate(module!);
    const html = renderToString(
      <IdsProvider theme={testTheme}>
        <Example />
      </IdsProvider>,
    );
    expect(html).not.toBe('');
  });
});

describe('a name the story file declares never passes for a global', () => {
  test.for([
    'name',
    'status',
    'length',
    'event',
    'top',
    'open',
    'origin',
    'Option',
    'Audio',
    'Node',
  ])('%s', (name) => {
    expect(resolveLiveImport(name)).toBeUndefined();
  });

  test.for(['Math', 'Date', 'JSON', 'window', 'document', 'console'])('%s is a global', (name) => {
    expect(resolveLiveImport(name)).toBeNull();
  });
});
