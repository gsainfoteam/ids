import { act } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import {
  Calendar,
  DateField,
  Dialog,
  IdsProvider,
  PasswordField,
  Rating,
  Select,
  TextArea,
  TimePicker,
  toast,
  type IdsMessageKey,
  type IdsTranslate,
} from '../src';
import { testTheme } from './theme';
import { english, inEnglish } from './translation-checks';

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

test('a key the app does not translate falls back to Korean', async () => {
  const missing = new Set<IdsMessageKey>(['common.close', 'passwordField.show']);
  const partial: IdsTranslate = (key, values) =>
    key === 'passwordField.show' ? key : missing.has(key) ? undefined : english(key, values);

  const screen = await render(
    <IdsProvider theme={testTheme} translate={partial}>
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Profile</Dialog.Title>
          <PasswordField aria-label="Password" />
        </Dialog.Content>
      </Dialog>
    </IdsProvider>,
  );

  await expect.element(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  await expect.element(screen.getByRole('button', { name: '비밀번호 표시' })).toBeInTheDocument();
});

test('the nearest provider translates, and one without translate inherits it', async () => {
  const shouting: IdsTranslate = (key, values) => english(key, values)?.toUpperCase();

  const screen = await render(
    <IdsProvider theme={testTheme} translate={english}>
      <IdsProvider theme={testTheme} translate={shouting}>
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

test('the provider locale formats dates, and a nested provider locale overrides it', async () => {
  const screen = await render(
    <IdsProvider theme={testTheme} locale="en-US">
      <Calendar aria-label="Outer" />
      <IdsProvider.Scope locale="de-DE">
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
