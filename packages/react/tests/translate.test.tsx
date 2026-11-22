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
import { testTheme } from './theme';
import { english, inEnglish } from './translation-checks';

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
    <IdsProvider theme={testTheme} translate={partial}>
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
    <IdsProvider theme={testTheme} translate={english}>
      <IdsProvider theme={testTheme} translate={shouting}>
        <Calendar aria-label="Shouting" />
      </IdsProvider>
      <IdsProvider theme={testTheme} mode="dark">
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
    <IdsProvider theme={testTheme} locale="en-US">
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
