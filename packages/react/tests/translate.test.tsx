import { act, type ReactNode } from 'react';

import {
  composeStories,
  setProjectAnnotations,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { IntlMessageFormat } from 'intl-messageformat';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import * as preview from '../.storybook/preview';
import englishCatalog from '../messages/en.json';
import {
  Calendar,
  DateField,
  Dialog,
  FileField,
  IdsProvider,
  OTPField,
  Rating,
  Select,
  TextArea,
  TimePicker,
  toast,
  type IdsMessageKey,
  type IdsTranslate,
} from '../src';
import { messages } from '../src/internal/messages';

type StoryFile = Record<string, StoryObj> & { default: Meta };

type Catalog = { [name: string]: string | Catalog };

const lookup = (catalog: Catalog, key: string) =>
  key
    .split('.')
    .reduce<string | Catalog>((node, name) => (node as Catalog)[name], catalog) as string;

const leafValues = (catalog: Catalog): string[] =>
  Object.values(catalog).flatMap((value) =>
    typeof value === 'string' ? [value] : leafValues(value),
  );

const english: IdsTranslate = (key, values) =>
  new IntlMessageFormat(lookup(englishCatalog, key), 'en-US').format(values) as string;

const inEnglish = (children: ReactNode) => (
  <IdsProvider translate={english} locale="en-US">
    {children}
  </IdsProvider>
);

const project = setProjectAnnotations([preview]);
beforeAll(project.beforeAll);

const storyFiles = import.meta.glob<StoryFile>('../src/**/*.stories.tsx', { eager: true });
const storySources = import.meta.glob<string>('../src/**/*.stories.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const HANGUL = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/;
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const koreanDefaults = leafValues(messages)
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

describe('every story under an English translate shows no Korean of its own', () => {
  for (const [path, module] of Object.entries(storyFiles)) {
    const source = withoutPlayAndDocs(storySources[path]);
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

test('open popups, fields and live regions speak the translation', async () => {
  const screen = await render(
    inEnglish(
      <>
        <Calendar />
        <TimePicker />
        <DateField />
        <FileField />
        <OTPField length={4} />
        <Rating defaultValue={3} />
      </>,
    ),
  );

  await expect.element(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
  await expect.element(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
  await expect.element(screen.getByText('Pick a date')).toBeInTheDocument();
  await expect.element(screen.getByText('Choose or drop files')).toBeInTheDocument();
  await expect
    .element(screen.getByRole('textbox', { name: 'Verification code' }))
    .toBeInTheDocument();
  await expect.element(screen.getByRole('radio', { name: '3 out of 5' })).toBeChecked();
});

test('an open Dialog names its close button in the translation', async () => {
  const screen = await render(
    inEnglish(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Profile</Dialog.Title>
        </Dialog.Content>
      </Dialog>,
    ),
  );

  await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
});

test('Select search and empty state speak the translation', async () => {
  const screen = await render(
    inEnglish(
      <Select aria-label="Fruit" defaultOpen>
        <Select.SearchField />
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Empty />
      </Select>,
    ),
  );

  await userEvent.fill(screen.getByRole('combobox', { name: 'Search options' }), 'zzz');
  await expect.element(screen.getByText('No results found.')).toBeVisible();
});

test('a loading toast without a message reads the translation', async () => {
  render(inEnglish(null));
  act(() => {
    toast.loading();
  });

  await expect.element(page.getByText('Working on it')).toBeVisible();
  expect(document.querySelector('[data-toaster-region]')!.getAttribute('aria-label')).toMatch(
    /^Notifications/,
  );
  act(() => toast.dismissAll());
});

test('ICU plurals come from the app formatter', async () => {
  const screen = await render(
    inEnglish(
      <TextArea maxLength={20} aria-label="Bio">
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>,
    ),
  );
  const textarea = screen.getByRole('textbox', { name: 'Bio' });

  await userEvent.fill(textarea, '0123456789012345678');
  await expect.element(screen.getByRole('status')).toHaveTextContent('1 character left.');
  await userEvent.fill(textarea, '012345678901234567');
  await expect.element(screen.getByRole('status')).toHaveTextContent('2 characters left.');
});

test('a key the app does not translate falls back to Korean', async () => {
  const missing = new Set<IdsMessageKey>(['dialog.close', 'calendar.nextMonth']);
  const partial: IdsTranslate = (key, values) =>
    key === 'calendar.nextMonth' ? key : missing.has(key) ? undefined : english(key, values);

  const screen = await render(
    <IdsProvider translate={partial}>
      <Calendar />
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Profile</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  const calendar = screen.container.querySelector<HTMLElement>('[data-calendar]')!;
  expect(calendar.querySelector('[aria-label="다음 달"]')).not.toBeNull();
  expect(calendar.querySelector('[aria-label="Previous month"]')).not.toBeNull();
});

test('the nearest provider translates, and one without translate inherits it', async () => {
  const shouting: IdsTranslate = (key, values) => english(key, values)?.toUpperCase();

  const screen = await render(
    <IdsProvider translate={english}>
      <IdsProvider translate={shouting}>
        <Calendar aria-label="Shouting" />
      </IdsProvider>
      <IdsProvider mode="dark">
        <Calendar aria-label="Inherited" />
      </IdsProvider>
    </IdsProvider>,
  );

  const shoutingCalendar = screen.getByRole('group', { name: 'Shouting' });
  const inheritedCalendar = screen.getByRole('group', { name: 'Inherited' });
  await expect
    .element(shoutingCalendar.getByRole('button', { name: 'PREVIOUS MONTH' }))
    .toBeInTheDocument();
  await expect
    .element(inheritedCalendar.getByRole('button', { name: 'Previous month' }))
    .toBeInTheDocument();
});

test('the provider locale formats dates, and a component locale overrides it', async () => {
  const screen = await render(
    <IdsProvider locale="en-US">
      <Calendar aria-label="Provider" />
      <Calendar aria-label="Component" locale="de-DE" />
    </IdsProvider>,
  );

  const month = new Date().toLocaleString('en-US', { month: 'long' });
  const monat = new Date().toLocaleString('de-DE', { month: 'long' });
  await expect
    .element(screen.getByRole('group', { name: 'Provider' }))
    .toMatchTextContent(new RegExp(month));
  await expect
    .element(screen.getByRole('group', { name: 'Component' }))
    .toMatchTextContent(new RegExp(monat));
});

test('server HTML under a translation hydrates without a mismatch', async () => {
  const tree = inEnglish(
    <>
      <DateField />
      <TextArea maxLength={20} aria-label="Bio">
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>
      <Rating defaultValue={2} />
    </>,
  );
  const host = document.createElement('div');
  host.innerHTML = renderToString(tree);
  document.body.append(host);
  const serverText = host.textContent;

  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const errors = vi.spyOn(console, 'error');
  const recoverable: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(host, tree, { onRecoverableError: (error) => recoverable.push(error) });
  });

  expect(recoverable).toEqual([]);
  expect(errors.mock.calls).toEqual([]);
  expect(host.textContent).toBe(serverText);
  expect(serverText).toContain('Pick a date');
  errors.mockRestore();
  act(() => root?.unmount());
  host.remove();
});
