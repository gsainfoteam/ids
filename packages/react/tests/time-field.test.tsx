import { StrictMode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { TimeField } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const col = (unit: string) =>
  document.querySelector<HTMLElement>(`[role=dialog] [data-time-column="${unit}"]`)!;
const option = (unit: string, n: number) =>
  col(unit).querySelector<HTMLElement>(`[data-time-option="${n}"]`)!;
const d = (day = 15, hour = 9, minute = 30, second = 0) =>
  new Date(2026, 8, day, hour, minute, second);

test('SSR: display follows format, hourCycle and the locale tag; FormData follows precision', () => {
  const at = d(15, 14, 5, 9);
  const html = (props: TimeField.Props) =>
    parse(
      renderToString(
        <form>
          <TimeField name="at" {...props} />
        </form>,
      ),
    );
  const text = (props: TimeField.Props) =>
    html({ defaultValue: at, ...props }).querySelector('[role=combobox]')!.textContent;
  expect(text({})).toBe('오후 2:05');
  expect(text({ hourCycle: '12h' })).toBe('오후 2:05');
  expect(text({ hourCycle: '24h' })).toBe('14:05');
  expect(text({ precision: 'second' })).toBe('오후 2:05:09');
  expect(text({ precision: 'hour' })).toBe('오후 2시');
  expect(text({ locale: 'en-US' })).toBe('2:05 PM');
  expect(text({ locale: 'en-US', hourCycle: '24h' })).toBe('14:05');
  expect(text({ locale: 'de-DE' })).toBe('14:05');
  expect(text({ locale: 'de-DE', hourCycle: '12h' })).toMatch(/^2:05\s?PM$/);
  expect(text({ locale: 'ja-JP' })).toBe('14:05');
  expect(text({ locale: 'ja-JP', hourCycle: '12h' })).toBe('午後2:05');
  expect(text({ format: { hour: '2-digit', minute: '2-digit' }, hourCycle: '24h' })).toBe('14:05');
  expect(text({ format: { hour: 'numeric', hourCycle: 'h23' }, hourCycle: '12h' })).toBe('14시');
  expect(text({ format: { timeStyle: 'short' }, locale: 'en-US', hourCycle: '24h' })).toBe('14:05');
  expect(text({ format: (date) => `${date.getHours()}시` })).toBe('14시');
  expect(text({ format: (date, locale) => `${locale} ${date.getHours()}` })).toBe('ko-KR 14');
  const form = (props: TimeField.Props) =>
    new FormData(html({ defaultValue: at, ...props }).querySelector('form')!).get('at');
  expect(form({ precision: 'hour' })).toBe('14');
  expect(form({})).toBe('14:05');
  expect(form({ precision: 'second' })).toBe('14:05:09');
  const empty = html({});
  expect(empty.querySelector('[role=combobox]')!.textContent).toBe('시간 선택');
  expect(new FormData(empty.querySelector('form')!).get('at')).toBeNull();
  expect(() => text({ locale: 'de_DE' })).toThrow(/BCP 47/);
});

test('StrictMode: ArrowDown focuses the first column, picks stay open, Escape and Clear', async () => {
  const changes: (Date | null)[] = [];
  const screen = await render(
    <StrictMode>
      <TimeField defaultValue={d()} hourCycle="24h" onValueChange={(next) => changes.push(next)} />
    </StrictMode>,
  );
  const trigger = screen.getByRole('combobox');
  trigger.element().focus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(col('hour')).toHaveFocus();
  await userEvent.click(option('hour', 14));
  await userEvent.click(option('minute', 45));
  expect(changes.map((value) => [value?.getHours(), value?.getMinutes()])).toEqual([
    [14, 30],
    [14, 45],
  ]);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toHaveTextContent('14:45');
  await userEvent.click(screen.getByRole('button', { name: '시간 지우기' }));
  expect(changes.at(-1)).toBeNull();
  await expect.element(trigger).toHaveTextContent('시간 선택');
});

test('Delete inside the picker clears the field too', async () => {
  const changes: (Date | null)[] = [];
  const screen = await render(
    <TimeField defaultValue={d()} hourCycle="24h" onValueChange={(next) => changes.push(next)} />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(col('hour')).toHaveFocus();
  await userEvent.keyboard('{Delete}');
  expect(changes).toEqual([null]);
  expect(document.querySelector('[aria-selected=true]')).toBeNull();
});

test('an empty field builds the picked time on referenceDate', async () => {
  let value = null as Date | null;
  const screen = await render(
    <TimeField
      hourCycle="24h"
      referenceDate={new Date(2030, 0, 2)}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(option('hour', 8));
  expect([value?.getFullYear(), value?.getMonth(), value?.getDate(), value?.getHours()]).toEqual([
    2030, 0, 2, 8,
  ]);
});

test('custom parts, readOnly, and a native onClick that prevents opening', async () => {
  const screen = await render(
    <TimeField defaultValue={d()} readOnly>
      <TimeField.Trigger asChild>
        <button>
          <TimeField.Value />
        </button>
      </TimeField.Trigger>
      <TimeField.Clear />
    </TimeField>,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  const clear = screen.getByRole('button', { name: '시간 지우기' });
  await expect.element(clear).toHaveAttribute('disabled');
  await expect.element(clear).toHaveAttribute('data-variant', 'ghost');
  await expect.element(clear).toHaveAttribute('data-disabled');
  await screen.rerender(<TimeField onClick={(event) => event.preventDefault()} />);
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await screen.rerender(
    <TimeField mobileVariant="drawer">
      <TimeField.Content>Custom time controls</TimeField.Content>
    </TimeField>,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(screen.getByRole('dialog')).toMatchTextContent('Custom time controls');
  await expect.element(screen.getByRole('button', { name: '닫기' })).toHaveFocus();
  await expect.element(screen.getByRole('dialog')).toHaveAttribute('aria-label', '시간 선택');
});

test('required and native reset go through the hidden form value', async () => {
  const changes: (Date | null)[] = [];
  const screen = await render(
    <form>
      <TimeField name="at" required hourCycle="24h" onValueChange={(next) => changes.push(next)} />
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  expect(form.checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(option('hour', 7));
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get('at')).toBe('07:00');
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  form.reset();
  await expect.poll(() => new FormData(form).get('at')).toBeNull();
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  expect(changes).toHaveLength(1);
});
