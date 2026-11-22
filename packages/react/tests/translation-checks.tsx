import { type ReactNode } from 'react';

import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import { IntlMessageFormat } from 'intl-messageformat';
import { beforeAll, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import * as preview from '../.storybook/preview';
import englishCatalog from '../messages/en.json';
import { IdsProvider, type IdsTranslate } from '../src';
import { testTheme } from './theme';
import { everyMessage } from '../src/internal/every-message';

import type { StoryFiles } from './story-checks';

type Catalog = { [name: string]: string | Catalog };

export type StorySources = Record<string, string>;

const lookup = (catalog: Catalog, key: string) =>
  key
    .split('.')
    .reduce<string | Catalog>((node, name) => (node as Catalog)[name], catalog) as string;

const leafValues = (catalog: Catalog): string[] =>
  Object.values(catalog).flatMap((value) =>
    typeof value === 'string' ? [value] : leafValues(value),
  );

export const english: IdsTranslate = (key, values) =>
  new IntlMessageFormat(lookup(englishCatalog, key), 'en-US').format(values) as string;

export const inEnglish = (children: ReactNode) => (
  <IdsProvider theme={testTheme} translate={english} locale="en-US">
    {children}
  </IdsProvider>
);

const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const koreanDefaults = leafValues(everyMessage)
  .filter((pattern) => HANGUL.test(pattern))
  .map((pattern) => new RegExp(`^${escape(pattern).replace(/\\\{\w+\\\}/g, '.+')}$`));
const NAMING_ATTRIBUTES = [
  'aria-label',
  'aria-roledescription',
  'aria-valuetext',
  'placeholder',
  'title',
];

function koreanShown(root: HTMLElement) {
  const shown: string[] = [];
  for (const element of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    for (const name of NAMING_ATTRIBUTES) {
      const value = element.getAttribute(name);
      if (value && HANGUL.test(value)) shown.push(value);
    }
    for (const node of element.childNodes)
      if (node.nodeType === Node.TEXT_NODE && HANGUL.test(node.textContent ?? ''))
        shown.push(node.textContent!.trim());
  }
  return shown;
}

function closingBrace(code: string, open: number) {
  let depth = 0;
  for (let index = open; index < code.length; index++) {
    if (code[index] === '{') depth++;
    else if (code[index] === '}' && --depth === 0) return index;
  }
  return code.length;
}

function withoutPlayAndDocs(source: string) {
  let code = source;
  for (const block of [/\bplay: [\s\S]*?=> \{/, /\bparameters: \{/]) {
    for (let found = block.exec(code); found; found = block.exec(code)) {
      const open = found.index + found[0].length - 1;
      code = code.slice(0, found.index) + code.slice(closingBrace(code, open) + 1);
    }
  }
  return code;
}

const IMPORTED_STORY_FILE = /from '(\.\/[\w.-]+\.stories)'/g;

function sourceWithTheStoriesItImports(storySources: StorySources, path: string) {
  const directory = path.slice(0, path.lastIndexOf('/') + 1);
  const imported = [...storySources[path].matchAll(IMPORTED_STORY_FILE)].map(
    ([, module]) => storySources[`${directory}${module.slice(2)}.tsx`] ?? '',
  );
  return [storySources[path], ...imported].join('\n');
}

export function checkEveryStoryInEnglish(storyFiles: StoryFiles, storySources: StorySources) {
  const project = setProjectAnnotations([preview]);
  beforeAll(project.beforeAll);

  describe('every story under an English translate shows no Korean of its own', () => {
    for (const [path, module] of Object.entries(storyFiles)) {
      const source = withoutPlayAndDocs(sourceWithTheStoriesItImports(storySources, path));
      for (const [name, Story] of Object.entries(composeStories(module))) {
        test(`${path.replace('../src/', '')} ${name}`, async () => {
          const screen = await render(inEnglish(<Story />));
          const storyTemplates = [...source.matchAll(/`([^`]*\$\{[^`]*)`/g)]
            .filter(([, template]) => HANGUL.test(template))
            .map(
              ([, template]) =>
                new RegExp(`^${escape(template).replace(/\\\$\\\{[^}]*\\\}/g, '.+')}$`),
            );
          const writtenByTheStory = (text: string) =>
            source.includes(text) || storyTemplates.some((template) => template.test(text));
          const leaked = koreanShown(screen.container).filter(
            (text) =>
              !writtenByTheStory(text) && koreanDefaults.some((pattern) => pattern.test(text)),
          );

          expect(leaked).toEqual([]);
        });
      }
    }
  });
}
