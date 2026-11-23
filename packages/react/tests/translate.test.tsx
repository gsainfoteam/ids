import { act } from 'react';

import { noop } from 'es-toolkit';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  Calendar,
  DateField,
  defineIdsLocale,
  Dialog,
  IdsProvider,
  PasswordField,
  Rating,
  Select,
  TextArea,
  TimePicker,
  toast,
  type IdsLocale,
} from '../src';
import { testTheme } from './theme';
import { inEnglish } from './translation-checks';
import { en } from '../src/locales/en';

test('open popups, fields and live regions speak the translation', async () => {
  const screen = await render(
    inEnglish(
      <>
        <Calendar aria-label="Calendar" />
        <TimePicker aria-label="Time" />
        <Rating aria-label="Rating" defaultValue={3} />
      </>,
    ),
  );

  await expect.element(screen.getByRole('button', { name: 'last month' })).toBeInTheDocument();
  await expect.element(screen.getByRole('listbox', { name: 'Hour' })).toBeInTheDocument();
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

test('Select search speaks the translation', async () => {
  const screen = await render(
    inEnglish(
      <Select aria-label="Fruit" defaultOpen>
        <Select.SearchField />
        <Select.Item value="apple">Apple</Select.Item>
      </Select>,
    ),
  );

  await expect.element(screen.getByRole('combobox', { name: 'Search' })).toBeInTheDocument();
});

test('a loading toast without a message reads the translation', async () => {
  render(inEnglish(null));
  act(() => {
    toast.loading();
  });

  await expect.element(page.getByText('Loading')).toBeVisible();
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
  await expect.element(screen.getByRole('status')).toHaveTextContent('Characters left: 1');
  await userEvent.fill(textarea, '012345678901234567');
  await expect.element(screen.getByRole('status')).toHaveTextContent('Characters left: 2');
});

test('a partial locale reads the rest from its base, not from Korean', async () => {
  const partial = defineIdsLocale({
    language: 'en',
    tag: 'en-GB',
    messages: { passwordField: { show: 'Reveal password' } },
    base: en,
  });

  const screen = await render(
    <IdsProvider theme={testTheme} locale={partial}>
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Profile</Dialog.Title>
          <PasswordField aria-label="Password" />
        </Dialog.Content>
      </Dialog>
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  await expect.element(screen.getByRole('button', { name: 'Reveal password' })).toBeInTheDocument();
});

test('a nested locale replaces the whole locale, and a provider without one inherits it', async () => {
  const shouting = defineIdsLocale({
    language: 'en',
    tag: 'en-US',
    messages: { passwordField: { show: 'SHOW PASSWORD' } },
    base: en,
  });

  const screen = await render(
    <IdsProvider theme={testTheme} locale={en}>
      <IdsProvider theme={testTheme} locale={shouting}>
        <div data-testid="shouting">
          <PasswordField aria-label="Shouting" />
        </div>
      </IdsProvider>
      <IdsProvider theme={testTheme} mode="dark">
        <div data-testid="inherited">
          <PasswordField aria-label="Inherited" />
        </div>
      </IdsProvider>
    </IdsProvider>,
  );

  await expect
    .element(screen.getByTestId('shouting').getByRole('button', { name: 'SHOW PASSWORD' }))
    .toBeInTheDocument();
  await expect
    .element(screen.getByTestId('inherited').getByRole('button', { name: 'Show password' }))
    .toBeInTheDocument();
});

test('the locale tag formats dates, and a nested locale overrides it', async () => {
  const german = defineIdsLocale({ language: 'de', tag: 'de-DE', messages: {}, base: en });
  const screen = await render(
    <IdsProvider theme={testTheme} locale={en}>
      <Calendar aria-label="Outer" />
      <IdsProvider.Scope locale={german}>
        <Calendar aria-label="Nested" />
        <TimePicker aria-label="Nested time" />
      </IdsProvider.Scope>
    </IdsProvider>,
  );

  const month = new Date().toLocaleString('en-US', { month: 'long' });
  const monat = new Date().toLocaleString('de-DE', { month: 'long' });
  await expect
    .element(screen.getByRole('group', { name: 'Outer' }))
    .toMatchTextContent(new RegExp(month));
  await expect
    .element(screen.getByRole('group', { name: 'Nested', exact: true }))
    .toMatchTextContent(new RegExp(monat));
  await expect
    .element(screen.getByRole('group', { name: 'Nested time' }))
    .toHaveAttribute('data-hour-cycle', '24h');
});

test('a tag of another language than the messages warns once in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
  const mixed = { ...en, tag: 'fr-FR' } as IdsLocale;

  await render(
    <IdsProvider theme={testTheme} locale={mixed}>
      <PasswordField aria-label="Password" />
      <IdsProvider.Scope locale={mixed}>
        <PasswordField aria-label="Again" />
      </IdsProvider.Scope>
    </IdsProvider>,
  );

  const mismatches = warn.mock.calls.filter(([message]) => String(message).includes('"fr-FR"'));
  expect(mismatches).toHaveLength(1);
  warn.mockRestore();
});

test('server HTML under a translation hydrates without a mismatch', async () => {
  const tree = inEnglish(
    <>
      <DateField aria-label="Date" />
      <TextArea maxLength={20} aria-label="Bio">
        <TextArea.Input />
        <TextArea.Count />
      </TextArea>
      <Rating aria-label="Rating" defaultValue={2} />
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
  expect(host.innerHTML).toContain('aria-label="2 out of 5"');
  errors.mockRestore();
  act(() => root?.unmount());
  host.remove();
});
