import { de } from 'date-fns/locale/de';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { TimePicker } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const ssr = (props: TimePicker.Props) => parse(renderToString(<TimePicker {...props} />));
const col = (unit: string) => document.querySelector<HTMLElement>(`[data-time-column="${unit}"]`)!;
const option = (unit: string, n: number) =>
  col(unit).querySelector<HTMLElement>(`[data-time-option="${n}"]`)!;
const d = (h: number, m = 0, s = 0) => new Date(2026, 8, 15, h, m, s);
const labels = (doc: Document) =>
  [...doc.querySelectorAll('[role=listbox]')].map((node) => node.getAttribute('aria-label'));
const periods = (doc: Document) =>
  [...doc.querySelectorAll('[data-time-column=period] [role=option]')].map(
    (node) => node.textContent,
  );
const OPTION_HEIGHT = 36;
const scrollSettles = () => new Promise((resolve) => setTimeout(resolve, 200));

test('SSR: Korean names by default, the clock and periods from the date-fns locale, diagnostics', () => {
  const doc = ssr({ precision: 'second', step: 15 });
  expect(doc.querySelector('[role=group]')!.getAttribute('aria-label')).toBe('시간');
  expect(labels(doc)).toEqual(['오전/오후', '시', '분', '초']);
  expect(doc.querySelector('[data-time-picker]')!.getAttribute('data-format')).toBe('12h');
  expect(doc.querySelectorAll('[data-time-column=second] [role=option]')).toHaveLength(4);
  expect(doc.querySelector('[data-time-picker]')!.hasAttribute('data-empty')).toBe(true);
  expect(periods(ssr({ format: '12h' }))).toEqual(['오전', '오후']);
  const english = ssr({ locale: 'en-US' });
  expect(english.querySelector('[data-time-picker]')!.getAttribute('data-format')).toBe('12h');
  expect(periods(english)).toEqual(['AM', 'PM']);
  expect(ssr({ locale: de }).querySelector('[data-time-column=period]')).toBeNull();
  expect(() => ssr({ locale: 'de-DE' })).toThrow(/no built-in date-fns locale/);
  for (const props of [
    { step: 0 },
    { step: 15, precision: 'hour' },
    { min: d(18), max: d(9) },
  ] as const)
    expect(() => ssr(props)).toThrow();
  expect(() =>
    renderToString(
      <TimePicker format="24h">
        <TimePicker.Period />
      </TimePicker>,
    ),
  ).toThrow(/Period requires/);
  expect(() =>
    renderToString(
      <TimePicker>
        <TimePicker.Column unit="hour" />
        <TimePicker.Column unit="hour" />
      </TimePicker>,
    ),
  ).toThrow(/duplicate/);
  expect(() =>
    renderToString(
      <TimePicker precision="hour">
        <TimePicker.Column unit="minute" />
      </TimePicker>,
    ),
  ).toThrow(/precision/);
});

test('arrows browse without committing, Enter commits, the date is kept', async () => {
  let value = undefined as Date | null | undefined;
  await render(
    <TimePicker
      defaultValue={d(9, 15)}
      format="24h"
      step={15}
      onValueChange={(next) => (value = next)}
    />,
  );
  col('hour').focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(value).toBeUndefined();
  await expect.element(option('hour', 10)).toHaveAttribute('data-active');
  await expect.element(col('hour')).toHaveAttribute('aria-activedescendant', option('hour', 10).id);
  await userEvent.keyboard('{Enter}');
  expect(value?.getHours()).toBe(10);
  expect(value?.getMinutes()).toBe(15);
  expect(value?.getDate()).toBe(15);
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(col('minute')).toHaveFocus();
  await userEvent.keyboard('{End}[Space]');
  expect(value?.getMinutes()).toBe(45);
  await userEvent.keyboard('{Home}{Enter}');
  expect(value?.getMinutes()).toBe(0);
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(col('hour')).toHaveFocus();
  await userEvent.keyboard('{PageDown}');
  await expect.element(option('hour', 15)).toHaveAttribute('data-active');
  await userEvent.keyboard('{PageUp}');
  await expect.element(option('hour', 10)).toHaveAttribute('data-active');
});

test('picking the time that is already selected is not a change', async () => {
  const onValueChange = vi.fn();
  await render(<TimePicker defaultValue={d(9, 30)} format="24h" onValueChange={onValueChange} />);
  await userEvent.click(option('hour', 9));
  await userEvent.click(option('minute', 30));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('typing digits jumps to the matching option and a repeated key cycles', async () => {
  let value = undefined as Date | null | undefined;
  await render(
    <TimePicker defaultValue={d(9)} format="24h" onValueChange={(next) => (value = next)} />,
  );
  col('hour').focus();
  await userEvent.keyboard('1');
  await expect.element(option('hour', 10)).toHaveAttribute('data-active');
  await userEvent.keyboard('4');
  await expect.element(option('hour', 14)).toHaveAttribute('data-active');
  await userEvent.keyboard('{Enter}');
  expect(value?.getHours()).toBe(14);
  col('minute').focus();
  await userEvent.keyboard('4');
  await expect.element(option('minute', 4)).toHaveAttribute('data-active');
  await userEvent.keyboard('5');
  await expect.element(option('minute', 45)).toHaveAttribute('data-active');
});

test('Delete and Backspace clear the value to null', async () => {
  const changes: (Date | null)[] = [];
  await render(
    <TimePicker
      defaultValue={d(9, 30)}
      format="24h"
      onValueChange={(next) => changes.push(next)}
    />,
  );
  col('minute').focus();
  await userEvent.keyboard('{Delete}');
  expect(changes).toEqual([null]);
  expect(document.querySelector('[aria-selected=true]')).toBeNull();
  await expect
    .element(document.querySelector<HTMLElement>('[data-time-picker]'))
    .toHaveAttribute('data-empty');
  await userEvent.keyboard('{Backspace}');
  expect(changes).toEqual([null]);
});

test('right-to-left pickers swap the column arrows', async () => {
  await render(
    <div dir="rtl">
      <TimePicker defaultValue={d(9)} format="24h" />
    </div>,
  );
  col('hour').focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(col('minute')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(col('hour')).toHaveFocus();
});

test('a 12-hour column starts at 12', () => {
  const doc = ssr({ format: '12h', precision: 'hour' });
  expect(
    [...doc.querySelectorAll('[data-time-column=hour] [role=option]')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
});

test('12h noon/midnight and range-aware upper-unit selection', async () => {
  let value = undefined as Date | null | undefined;
  const screen = await render(
    <TimePicker defaultValue={d(0, 30)} format="12h" onValueChange={(next) => (value = next)} />,
  );
  await userEvent.click(option('period', 1));
  expect(value?.getHours()).toBe(12);
  await userEvent.click(option('period', 0));
  expect(value?.getHours()).toBe(0);
  await screen.rerender(
    <TimePicker
      value={d(9, 30)}
      format="24h"
      step={15}
      min={d(9, 30)}
      max={d(10, 15)}
      onValueChange={(next) => (value = next)}
    />,
  );
  await expect.element(option('hour', 8)).toHaveAttribute('aria-disabled', 'true');
  await expect.element(option('hour', 8)).toHaveAttribute('data-disabled');
  await userEvent.click(option('hour', 10));
  expect(value?.getHours()).toBe(10);
  expect(value?.getMinutes()).toBe(15);
  await expect.element(option('minute', 15)).toHaveAttribute('aria-disabled', 'true');
});

test('controlled values, none/readonly/disabled and hour precision', async () => {
  let value = undefined as Date | null | undefined;
  const view = (props: Partial<TimePicker.Props>) => (
    <TimePicker
      value={d(9, 37, 20)}
      precision="hour"
      format="24h"
      onValueChange={(next) => (value = next)}
      {...props}
    />
  );
  const screen = await render(view({}));
  await userEvent.click(option('hour', 10));
  expect(value?.getMinutes()).toBe(0);
  expect(value?.getSeconds()).toBe(0);
  await expect.element(option('hour', 9)).toHaveAttribute('aria-selected', 'true');
  await expect.element(option('hour', 9)).toHaveAttribute('data-selected');
  for (const props of [
    { selectionMode: 'none' },
    { readOnly: true },
    { disabled: true },
  ] as const) {
    value = undefined;
    await screen.rerender(view(props));
    await userEvent.click(option('hour', 10), { force: true });
    col('hour').focus();
    await userEvent.keyboard('{Delete}');
    expect(value).toBeUndefined();
  }
  await expect.element(col('hour')).toHaveAttribute('tabindex', '-1');
  await expect
    .element(document.querySelector<HTMLElement>('[data-time-picker]'))
    .toHaveAttribute('data-disabled');
});

test('an empty picker builds the time on referenceDate, or on today', async () => {
  let value = undefined as Date | null | undefined;
  const screen = await render(
    <TimePicker
      format="24h"
      referenceDate={new Date(2030, 0, 2, 17, 45)}
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.click(option('hour', 14));
  expect(value).toEqual(new Date(2030, 0, 2, 14, 0));
  vi.useFakeTimers({ toFake: ['Date'] });
  try {
    vi.setSystemTime(new Date(2026, 8, 15, 10, 20));
    await screen.rerender(
      <TimePicker key="today" format="24h" onValueChange={(next) => (value = next)} />,
    );
    await userEvent.click(option('hour', 8));
    expect(value).toEqual(new Date(2026, 8, 15, 8, 0));
  } finally {
    vi.useRealTimers();
  }
});

test('wheel scroll selection and DST gaps do not emit normalized nonexistent hours', async () => {
  let value = undefined as Date | null | undefined;
  const screen = await render(
    <TimePicker
      defaultValue={d(9)}
      format="24h"
      variant="wheel"
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.wheel(col('hour'), { delta: { y: OPTION_HEIGHT } });
  await expect.poll(() => value?.getHours()).toBe(10);
  const column = col('hour');
  const ended = new Promise((resolve) =>
    column.addEventListener('scrollend', resolve, { once: true }),
  );
  column.scrollTop = 14 * OPTION_HEIGHT;
  await ended;
  await scrollSettles();
  expect(value?.getHours()).toBe(10);
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/New_York') {
    await screen.rerender(
      <TimePicker
        value={new Date(2026, 2, 8, 1, 30)}
        format="24h"
        onValueChange={(next) => (value = next)}
      />,
    );
    await expect.element(option('hour', 2)).toHaveAttribute('aria-disabled', 'true');
  }
});

test('empty 12h picker can enter an afternoon-only range', async () => {
  let value = undefined as Date | null | undefined;
  await render(
    <TimePicker format="12h" min={d(14)} max={d(18)} onValueChange={(next) => (value = next)} />,
  );
  await expect.element(option('period', 1)).not.toHaveAttribute('aria-disabled');
  await userEvent.click(option('period', 1));
  expect(value?.getHours()).toBe(14);
});

test('empty constrained picker starts on a valid draft without committing a value', async () => {
  let emitted = undefined as Date | null | undefined;
  await render(
    <TimePicker
      format="24h"
      min={d(9, 30)}
      max={d(18)}
      step={15}
      onValueChange={(next) => (emitted = next)}
    />,
  );
  await expect.element(col('hour')).toHaveAttribute('aria-activedescendant', option('hour', 9).id);
  await expect.element(option('minute', 30)).not.toHaveAttribute('aria-disabled');
  expect(document.querySelector('[aria-selected=true]')).toBeNull();
  expect(emitted).toBeUndefined();
  await userEvent.click(option('minute', 45));
  expect(emitted?.getHours()).toBe(9);
});

test('column positioning ignores its page offset and keeps clicked time visible', async () => {
  await render(
    <div style={{ paddingTop: 900 }}>
      <TimePicker defaultValue={d(9)} format="24h" />
    </div>,
  );
  const column = col('hour');
  expect(column.getBoundingClientRect().top + window.scrollY).toBeGreaterThanOrEqual(900);
  await userEvent.click(option('hour', 10));
  const middle = (node: HTMLElement) => {
    const rect = node.getBoundingClientRect();
    return rect.top + rect.height / 2;
  };
  await expect.poll(() => Math.abs(middle(option('hour', 10)) - middle(column))).toBeLessThan(1);
});

test('wheel commits at both edges without requiring another scroll event', async () => {
  let value = undefined as Date | null | undefined;
  await render(
    <TimePicker
      defaultValue={d(9)}
      format="24h"
      variant="wheel"
      onValueChange={(next) => (value = next)}
    />,
  );
  await userEvent.wheel(col('hour'), { delta: { y: 30 * OPTION_HEIGHT } });
  await expect.poll(() => value?.getHours()).toBe(23);
  await userEvent.wheel(col('hour'), { delta: { y: -30 * OPTION_HEIGHT } });
  await expect.poll(() => value?.getHours()).toBe(0);
});

test('pending wheel settlement respects a new readonly prop', async () => {
  const onValueChange = vi.fn();
  const view = (readOnly: boolean) => (
    <TimePicker
      value={d(9)}
      format="24h"
      variant="wheel"
      readOnly={readOnly}
      onValueChange={onValueChange}
    />
  );
  const screen = await render(view(false));
  const column = col('hour');
  column.dispatchEvent(new WheelEvent('wheel', { bubbles: true }));
  column.scrollTop = 10 * OPTION_HEIGHT;
  column.dispatchEvent(new Event('scroll'));
  await screen.rerender(view(true));
  await scrollSettles();
  expect(onValueChange).not.toHaveBeenCalled();
});

test('composition: header labels, option render functions and state-driven root props', async () => {
  await render(
    <TimePicker
      defaultValue={d(9, 30)}
      format="24h"
      step={30}
      className={(state) => (state.value ? 'has-value' : 'empty')}
      style={(state) => ({ opacity: state.disabled ? 0.5 : 1 })}
    >
      <TimePicker.Header />
      <TimePicker.Column unit="hour">
        {(o) => `${o.label}h${o.selected ? '*' : ''}`}
      </TimePicker.Column>
      <TimePicker.Separator />
      <TimePicker.Column unit="minute" aria-label="Minutes" />
    </TimePicker>,
  );
  const root = document.querySelector<HTMLElement>('[data-time-picker]')!;
  expect(root).toHaveClass('has-value');
  expect(root.style.opacity).toBe('1');
  expect(root.querySelector('[aria-hidden=true]')!.textContent).toBe('시분');
  expect(option('hour', 9).textContent).toBe('09h*');
  expect(col('minute')).toHaveAttribute('aria-label', 'Minutes');
  expect(root.querySelector(':scope > span')!.textContent).toBe(':');
});

test('a column ref attaches once and stays attached while the user picks', async () => {
  const attached = vi.fn();
  const detached = vi.fn();
  const columnRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    attached(node);
    return detached;
  };
  await render(
    <TimePicker defaultValue={d(9)} format="24h">
      <TimePicker.Column unit="hour" ref={columnRef} />
      <TimePicker.Column unit="minute" />
    </TimePicker>,
  );
  await userEvent.click(option('hour', 10));
  await expect.element(option('hour', 10)).toHaveAttribute('data-selected');
  expect(attached).toHaveBeenCalledExactlyOnceWith(col('hour'));
  expect(detached).not.toHaveBeenCalled();
});

test('a column rendered through asChild keeps its listbox role, options and keyboard', async () => {
  let value = undefined as Date | null | undefined;
  const screen = await render(
    <TimePicker
      defaultValue={d(9)}
      format="24h"
      precision="hour"
      onValueChange={(next) => (value = next)}
    >
      <TimePicker.Column unit="hour" asChild>
        <section className="custom" />
      </TimePicker.Column>
    </TimePicker>,
  );
  const custom = screen.getByRole('listbox');
  await expect.element(custom).toHaveClass('custom');
  expect(custom.element().tagName).toBe('SECTION');
  expect(custom.getByRole('option').elements()).toHaveLength(24);
  custom.element().focus();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  expect(value?.getHours()).toBe(10);
});
