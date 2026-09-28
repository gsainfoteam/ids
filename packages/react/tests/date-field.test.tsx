import { Fragment, StrictMode, useState } from 'react';

import { format as formatDate } from 'date-fns';
import { de } from 'date-fns/locale/de';
import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { DateField, DateTimeField, Field, type Calendar } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const field = () => document.querySelector<HTMLElement>('[data-date-field]')!;
const popup = () => document.querySelector<HTMLElement>('[role=dialog]');
const day = (key: string) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${key}"]`)!;
const clear = () => document.querySelector<HTMLButtonElement>('[data-temporal-clear]');
const textBox = () =>
  document.querySelector<HTMLInputElement>('[data-date-field] input[type=text]')!;
const formData = () => new FormData(document.querySelector('form')!);
const validator = () => document.querySelector<HTMLInputElement>('[data-form-value-validator]')!;
const d = (day: number, month = 9) => new Date(2026, month - 1, day);
const keyOf = (date: Date | null | undefined) => date && formatDate(date, 'yyyy-MM-dd');
const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
const resetSettles = () => new Promise((resolve) => setTimeout(resolve, 50));
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

async function copy(text: string) {
  const scratch = document.createElement('input');
  document.body.append(scratch);
  scratch.value = text;
  scratch.focus();
  scratch.select();
  await userEvent.copy();
  scratch.remove();
}

function autofill(input: HTMLInputElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

test('SSR: date-fns patterns, format functions, Field labelling and ISO local-date FormData', () => {
  for (const [format, locale, expected] of [
    [undefined, undefined, '2026.09.15'],
    [undefined, 'en-US', '09/15/2026'],
    [undefined, de, '15.09.2026'],
    ['yyyy-MM-dd', 'ko-KR', '2026-09-15'],
    ['yyyy년 M월 d일 (EEE)', 'ko-KR', '2026년 9월 15일 (화)'],
    ["EEE, MMM d 'at home'", 'en-US', 'Tue, Sep 15 at home'],
    ['PPP', 'en-US', 'September 15th, 2026'],
    [(date: Date) => longDate.format(date), undefined, 'September 15, 2026'],
  ] as const) {
    const doc = parse(
      renderToString(
        <form>
          <Field required>
            <Field.Label>Date</Field.Label>
            <DateField name="date" defaultValue={d(15)} format={format} locale={locale} />
          </Field>
        </form>,
      ),
    );
    const combobox = doc.querySelector('[role=combobox]')!;
    expect(combobox.textContent).toContain(expected);
    expect(doc.querySelector('label')!.htmlFor).toBe(combobox.id);
    expect(combobox.getAttribute('aria-required')).toBe('true');
    expect(combobox.getAttribute('aria-haspopup')).toBe('dialog');
    expect(new FormData(doc.querySelector('form')!).get('date')).toBe('2026-09-15');
    expect(doc.querySelector('button button')).toBeNull();
  }
  const empty = parse(renderToString(<DateField name="date" />));
  expect(empty.querySelector('[role=combobox]')!.textContent).toBe('날짜 선택');
  expect(empty.querySelector('[data-date-field]')!.hasAttribute('data-empty')).toBe(true);
  expect(empty.querySelector('[data-placeholder]')).not.toBeNull();
  expect(() => renderToString(<DateField defaultValue={d(15)} format="YYYY-MM-DD" />)).toThrow(
    /instead of `YYYY`/,
  );
  expect(() =>
    // @ts-expect-error A range takes { start, end }, not a date.
    renderToString(<DateField selectionMode="range" value={d(1)} />),
  ).toThrow(/range requires/);
  expect(() => renderToString(<DateField locale="de-DE" />)).toThrow(/no built-in/);
});

test('ArrowDown opens on the focused day, limits apply, a pick closes and Clear empties', async () => {
  const changes: (Date | null)[] = [];
  const screen = await render(
    <DateField
      today={d(15)}
      format="yyyy-MM-dd"
      min={d(10)}
      max={d(20)}
      disabled={(date) => date.getDate() === 16}
      onValueChange={(next) => changes.push(next)}
    />,
  );
  const trigger = screen.getByRole('combobox');
  trigger.element().focus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect.element(trigger).toHaveAttribute('aria-controls', popup()!.id);
  await expect.element(field()).toHaveAttribute('data-open');
  await expect.element(day('2026-09-15')).toHaveFocus();
  await userEvent.click(day('2026-09-16'), { force: true });
  expect(changes).toEqual([]);
  await userEvent.click(day('2026-09-18'));
  expect(changes.map(keyOf)).toEqual(['2026-09-18']);
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toMatchTextContent('2026-09-18');
  await userEvent.click(screen.getByRole('button', { name: '날짜 지우기' }));
  expect(changes.slice(1)).toEqual([null]);
  await expect.element(trigger).toHaveFocus();
  expect(clear()).toBeNull();
});

test('picking the day that is already chosen closes without reporting a change', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <DateField defaultValue={d(18)} today={d(15)} onValueChange={onValueChange} />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day('2026-09-18')).toHaveFocus();
  await userEvent.click(day('2026-09-18'));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  expect(onValueChange).not.toHaveBeenCalled();
});

test('StrictMode opens on the active day; custom content keeps the close button to focus', async () => {
  const screen = await render(
    <StrictMode>
      <DateField today={d(15)} />
    </StrictMode>,
  );
  const trigger = screen.getByRole('combobox');
  await userEvent.click(trigger);
  await expect.element(day('2026-09-15')).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await screen.rerender(
    <StrictMode>
      <DateField mobileVariant="drawer">
        <DateField.Content>Custom content</DateField.Content>
      </DateField>
    </StrictMode>,
  );
  await userEvent.click(trigger);
  await expect.element(screen.getByRole('dialog')).toMatchTextContent('Custom content');
  await expect.element(screen.getByRole('button', { name: '닫기' })).toHaveFocus();
  await expect.element(screen.getByRole('dialog')).toHaveAttribute('aria-label', '날짜 선택');
});

test('range stays open, a half-picked range is missing from FormData and fails required', async () => {
  let value = null as Calendar.Range | null;
  const screen = await render(
    <form>
      <DateField
        selectionMode="range"
        today={d(15)}
        name="trip"
        required
        format="yyyy-MM-dd"
        monthsToShow={2}
        onValueChange={(next) => (value = next)}
      />
    </form>,
  );
  const trigger = screen.getByRole('combobox');
  await expect.element(trigger).toMatchTextContent('기간 선택');
  await userEvent.click(trigger);
  await expect.element(screen.getByRole('dialog')).toHaveAttribute('aria-label', '기간 선택');
  await userEvent.click(day('2026-09-18'));
  expect(value?.end).toBeNull();
  await expect.element(trigger).toMatchTextContent('2026-09-18 – …');
  expect(formData().get('trip')).toBeNull();
  expect(validator().validity.valueMissing).toBe(true);
  await userEvent.click(day('2026-09-10'));
  expect(keyOf(value?.start)).toBe('2026-09-10');
  expect(keyOf(value?.end)).toBe('2026-09-18');
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await expect.element(trigger).toMatchTextContent('2026-09-10 – 2026-09-18');
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  expect(formData().get('trip')).toBe('2026-09-10/2026-09-18');
  expect(validator().validity.valueMissing).toBe(false);
});

test('multiple toggles, repeats FormData entries, and readOnly/disabled block editing', async () => {
  const view = (props: { value?: Date[]; readOnly?: boolean; disabled?: boolean }) => (
    <form>
      <DateField selectionMode="multiple" today={d(15)} name="dates" {...props} />
    </form>
  );
  const screen = await render(view({}));
  const trigger = screen.getByRole('combobox');
  await userEvent.click(trigger);
  await userEvent.click(day('2026-09-15'));
  await userEvent.click(day('2026-09-16'));
  await userEvent.click(day('2026-09-17'));
  await userEvent.click(day('2026-09-15'));
  expect(formData().getAll('dates')).toEqual(['2026-09-16', '2026-09-17']);
  await userEvent.keyboard('{Escape}');
  await expect.element(trigger).toMatchTextContent('2026.09.16, 2026.09.17');
  await userEvent.click(trigger);
  await userEvent.click(day('2026-09-18'));
  await expect.element(trigger).toMatchTextContent('2026.09.16, 2026.09.17, +1');
  await userEvent.keyboard('{Escape}');
  await screen.rerender(view({ value: [d(20)], readOnly: true }));
  await userEvent.click(trigger);
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(clear()).toHaveAttribute('disabled');
  await expect.element(field()).toHaveAttribute('data-readonly');
  await expect.element(trigger).toHaveAttribute('aria-readonly', 'true');
  expect(formData().getAll('dates')).toEqual(['2026-09-20']);
  await screen.rerender(view({ value: [d(20)], disabled: true }));
  await expect.element(trigger).toHaveAttribute('disabled');
  expect([...formData()]).toEqual([]);
});

test('native reset restores the default without reporting it, and a cancelled reset does nothing', async () => {
  const changes: (Date | null)[] = [];
  const screen = await render(
    <form>
      <DateField
        name="day"
        defaultValue={d(15)}
        format="yyyy-MM-dd"
        onValueChange={(next) => changes.push(next)}
      >
        <DateField.Trigger asChild>
          <button>
            <DateField.Value />
          </button>
        </DateField.Trigger>
        <DateField.Clear />
      </DateField>
      <button type="reset">초기화</button>
    </form>,
  );
  const trigger = screen.getByRole('combobox');
  await userEvent.click(trigger);
  await userEvent.click(day('2026-09-18'));
  expect(changes.map(keyOf)).toEqual(['2026-09-18']);
  const form = screen.container.querySelector('form')!;
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await userEvent.click(screen.getByRole('button', { name: '초기화' }));
  await resetSettles();
  expect(formData().get('day')).toBe('2026-09-18');
  await userEvent.click(screen.getByRole('button', { name: '초기화' }));
  await expect.poll(() => formData().get('day')).toBe('2026-09-15');
  await expect.element(trigger).toMatchTextContent('2026-09-15');
  expect(changes).toHaveLength(1);
});

test('required blocks the submit until a date is picked and hands the browser focus to the trigger', async () => {
  const submitted = vi.fn();
  const screen = await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <DateField name="day" required today={d(15)} />
      <button>제출</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const trigger = screen.getByRole('combobox');
  expect(validator()).not.toBeNull();
  expect(validator().validity.valueMissing).toBe(true);
  expect(form.checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('button', { name: '제출' }));
  expect(submitted).not.toHaveBeenCalled();
  await expect.element(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await userEvent.click(day('2026-09-18'));
  expect(form.checkValidity()).toBe(true);
  await screen.rerender(
    <form>
      <DateField name="day" required disabled today={d(15)} />
    </form>,
  );
  expect(screen.container.querySelector('form')!.checkValidity()).toBe(true);
});

test('open is controllable and onBlur waits until focus leaves the field and its popup', async () => {
  const opens: boolean[] = [];
  const onBlur = vi.fn();
  function App() {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button>outside</button>
        <DateField
          today={d(15)}
          open={open}
          onOpenChange={(next) => {
            opens.push(next);
            setOpen(next);
          }}
          onBlur={onBlur}
        />
      </div>
    );
  }
  const screen = await render(<App />);
  await userEvent.click(screen.getByRole('combobox'));
  expect(opens).toEqual([true]);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  expect(onBlur).not.toHaveBeenCalled();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(day('2026-09-16')).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'outside' }));
  expect(opens).toEqual([true, false]);
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  expect(onBlur).toHaveBeenCalledOnce();
});

test('state reaches className/style functions and data attributes', async () => {
  const screen = await render(
    <DateField
      defaultValue={d(15)}
      invalid
      required
      size="tiny"
      variant="soft"
      className={(state) => (state.empty ? 'is-empty' : 'has-date')}
      style={(state) => ({ opacity: state.invalid ? 0.9 : 1 })}
    />,
  );
  await expect.element(field()).toHaveClass('has-date');
  expect(field().style.opacity).toBe('0.9');
  await expect.element(field()).toHaveAttribute('data-size', 'tiny');
  await expect.element(field()).toHaveAttribute('data-variant', 'soft');
  await expect.element(field()).toHaveAttribute('data-required');
  await expect.element(field()).toHaveAttribute('data-invalid');
  await expect.element(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
});

test('react-hook-form value mode: required error focus, Date value, reset and disabled omission', async () => {
  type Values = { date: Date | null };
  const submitted = vi.fn();
  let methods!: UseFormReturn<Values>;
  function App({ disabled = false }: { disabled?: boolean }) {
    const form = useForm<Values>({ defaultValues: { date: null } });
    methods = form;
    return (
      <FormProvider {...form}>
        <form noValidate onSubmit={form.handleSubmit(submitted)}>
          <RHFField
            name="date"
            controlMode="value"
            disabled={disabled}
            registerOptions={{ required: 'Required' }}
          >
            <RHFField.Label>Date</RHFField.Label>
            <DateField today={d(15)} format="yyyy-MM-dd" />
            <RHFField.Error />
          </RHFField>
          <button type="submit">제출</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const trigger = screen.getByRole('combobox', { name: 'Date' });
  const submit = screen.getByRole('button', { name: '제출' });
  await userEvent.click(submit);
  await expect.element(trigger).toHaveFocus();
  await expect.element(screen.getByText('Required')).toHaveAttribute('data-field-part', 'error');
  await expect.element(trigger).toHaveAttribute('aria-invalid', 'true');
  await userEvent.click(trigger);
  await userEvent.click(day('2026-09-18'));
  await userEvent.click(submit);
  await expect.poll(() => keyOf(submitted.mock.lastCall?.[0].date)).toBe('2026-09-18');
  methods.reset();
  await expect.element(trigger).toMatchTextContent('날짜 선택');
  methods.setValue('date', d(20));
  await expect.element(trigger).toMatchTextContent('2026-09-20');
  await screen.rerender(<App disabled />);
  submitted.mockClear();
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.calls.length).toBe(1);
  expect(submitted.mock.lastCall?.[0].date).toBeUndefined();
});

test('popup width is anchored to the whole field and ignores descendant scrolls', async () => {
  await page.viewport(1024, 768);
  const reads = vi.spyOn(Element.prototype, 'getBoundingClientRect');
  try {
    for (const component of [
      <DateField
        selectionMode="multiple"
        today={d(15)}
        defaultValue={[d(15)]}
        style={{ width: 700 }}
      />,
      <DateTimeField today={d(15)} defaultValue={d(15)} style={{ width: 700 }} />,
    ]) {
      const screen = await render(component);
      const trigger = screen.getByRole('combobox');
      expect(trigger.element().getBoundingClientRect().width).toBeLessThan(700);
      await userEvent.click(trigger);
      await expect.poll(() => popup()!.style.width).toBe('700px');
      await frame();
      await frame();
      const before = reads.mock.calls.length;
      popup()!.firstElementChild!.dispatchEvent(new Event('scroll', { bubbles: false }));
      await frame();
      await frame();
      expect(reads.mock.calls.length).toBe(before);
      await userEvent.keyboard('{Escape}');
      await screen.unmount();
    }
  } finally {
    reads.mockRestore();
    await page.viewport(414, 896);
  }
});

test('parts: none gives Trigger and Clear, given parts are drawn as given, Trigger is always there', async () => {
  const screen = await render(
    <DateField defaultValue={d(15)}>
      <DateField.Clear aria-label="Wipe" />
    </DateField>,
  );
  await expect.element(screen.getByRole('combobox')).toBeInTheDocument();
  await expect.element(clear()).toHaveAttribute('aria-label', 'Wipe');
  await screen.rerender(
    <DateField key="bare" defaultValue={d(15)}>
      <DateField.Trigger />
    </DateField>,
  );
  expect(clear()).toBeNull();
  expect(() =>
    renderToString(
      <DateField defaultValue={d(15)}>
        <DateField.Trigger>
          <DateField.Clear />
        </DateField.Trigger>
      </DateField>,
    ),
  ).toThrow(/sibling of Trigger/);
});

test('Clear is a ghost IconButton in the field size that keeps its tab stop and its asChild look', async () => {
  const changes: (Date | null)[] = [];
  const screen = await render(
    <DateField defaultValue={d(15)} size="tiny" onValueChange={(next) => changes.push(next)} />,
  );
  expect(clear()!.tagName).toBe('BUTTON');
  await expect.element(clear()).toHaveAttribute('data-variant', 'ghost');
  await expect.element(clear()).toHaveAttribute('data-size', 'tiny');
  await expect.element(clear()).toHaveAttribute('type', 'button');
  expect(clear()!.tabIndex).toBe(0);
  await expect.element(clear()).toHaveClass('size-6');
  expect(clear()!.className).not.toMatch(/-m[se]-/);
  await screen.rerender(
    <DateField key="as-child" defaultValue={d(15)} onValueChange={(next) => changes.push(next)}>
      <DateField.Trigger />
      <DateField.Clear asChild>
        <button id="own">Wipe</button>
      </DateField.Clear>
    </DateField>,
  );
  await expect.element(clear()).toHaveAttribute('id', 'own');
  await expect.element(clear()).toHaveTextContent('Wipe');
  await expect.element(clear()).toHaveAttribute('aria-label', '날짜 지우기');
  await expect.element(clear()).toHaveAttribute('data-variant', 'ghost');
  await expect.element(clear()).toHaveClass('size-7');
  await userEvent.click(clear()!);
  expect(changes).toEqual([null]);
  await expect.element(screen.getByRole('combobox')).toHaveFocus();
});

test('the chevron gives way to Clear once there is a value', async () => {
  const screen = await render(<DateField today={d(15)} />);
  const trigger = screen.getByRole('combobox');
  expect(trigger.element().querySelectorAll('svg')).toHaveLength(2);
  await userEvent.click(trigger);
  await userEvent.click(day('2026-09-18'));
  expect(trigger.element().querySelectorAll('svg')).toHaveLength(1);
  expect(clear()).not.toBeNull();
  await screen.rerender(
    <DateField key="no-clear" defaultValue={d(15)}>
      <DateField.Trigger />
    </DateField>,
  );
  expect(trigger.element().querySelectorAll('svg')).toHaveLength(2);
});

test('every opening starts on the month of the chosen date', async () => {
  const screen = await render(<DateField defaultValue={d(15)} today={d(15)} />);
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
  await expect.element(day('2026-10-15')).toBeInTheDocument();
  await userEvent.keyboard('{Escape}');
  await userEvent.click(screen.getByRole('combobox'));
  await expect.element(day('2026-09-15')).toHaveFocus();
});

test('typed entry: the text box takes the label and role, the calendar button leaves the tab order', () => {
  const doc = parse(
    renderToString(
      <Field>
        <Field.Label>Birthday</Field.Label>
        <DateField name="birthday" required>
          <DateField.Input />
        </DateField>
      </Field>,
    ),
  );
  const input = doc.querySelector('input[type=text]')!;
  expect(doc.querySelector('label')!.htmlFor).toBe(input.id);
  expect(input.getAttribute('role')).toBe('combobox');
  expect(input.getAttribute('aria-haspopup')).toBe('dialog');
  expect(input.getAttribute('aria-required')).toBe('true');
  expect(input.getAttribute('autocomplete')).toBe('off');
  expect(input.getAttribute('placeholder')).toBe('YYYY.MM.DD');
  expect(input.hasAttribute('name')).toBe(false);
  const button = doc.querySelector('button')!;
  expect(button.getAttribute('aria-label')).toBe('달력 열기');
  expect(button.getAttribute('tabindex')).toBe('-1');
  expect(button.getAttribute('data-variant')).toBe('ghost');
  expect(button.getAttribute('aria-haspopup')).toBe('dialog');
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(() =>
    renderToString(
      <DateField selectionMode="range">
        <DateField.Input />
      </DateField>,
    ),
  ).toThrow(/reads typed text/);
  const named = parse(
    renderToString(
      <DateField aria-label="Birthday">
        <DateField.Input />
        <DateField.Trigger aria-label="Pick a birthday" />
      </DateField>,
    ),
  ).querySelector('button')!;
  expect(named.getAttribute('aria-label')).toBe('Pick a birthday');
});

test('typed entry reads the shown format, written forms, bare digits and the locale order', async () => {
  const changes: (string | null | undefined)[] = [];
  const view = (props: Pick<DateField.Props, 'locale' | 'format'>) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <DateField name="day" onValueChange={(next) => changes.push(keyOf(next))} {...props}>
        <DateField.Input />
      </DateField>
    </form>
  );
  const screen = await render(view({}));
  await userEvent.fill(textBox(), '2026-09-20');
  textBox().blur();
  expect(changes).toEqual(['2026-09-20']);
  await expect.element(textBox()).toHaveValue('2026.09.20');
  expect(formData().get('day')).toBe('2026-09-20');
  const enter = async (text: string) => {
    await userEvent.fill(textBox(), text);
    await userEvent.keyboard('{Enter}');
    return changes.at(-1);
  };
  expect(await enter('2026. 9. 21')).toBe('2026-09-21');
  expect(await enter('2026년 9월 22일')).toBe('2026-09-22');
  expect(await enter('20260923')).toBe('2026-09-23');
  expect(await enter('260924')).toBe('2026-09-24');
  expect(await enter('2026.9.25')).toBe('2026-09-25');
  await screen.rerender(<div key="en">{view({ locale: 'en-US' })}</div>);
  expect(await enter('9/25/2026')).toBe('2026-09-25');
  expect(await enter('09262026')).toBe('2026-09-26');
  expect(await enter('2026-09-27')).toBe('2026-09-27');
  expect(await enter('Sep 28, 2026')).toBe('2026-09-28');
  expect(await enter('9/29/26')).toBe('2026-09-29');
  await screen.rerender(<div key="de">{view({ locale: de })}</div>);
  expect(await enter('30.09.2026')).toBe('2026-09-30');
  await screen.rerender(
    <div key="pattern">{view({ format: 'dd MMM yyyy', locale: 'en-US' })}</div>,
  );
  expect(await enter('01 Oct 2026')).toBe('2026-10-01');
  await expect.element(textBox()).toHaveAttribute('placeholder', 'dd MMM yyyy');
});

test('typed entry keeps unreadable or blocked text, marks it invalid and Escape reverts it', async () => {
  const changes: (string | null | undefined)[] = [];
  const submitted = vi.fn();
  await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <DateField
        defaultValue={d(15)}
        min={d(10)}
        max={d(20)}
        onValueChange={(next) => changes.push(keyOf(next))}
      >
        <DateField.Input />
      </DateField>
    </form>,
  );
  await userEvent.fill(textBox(), '2026-13-40');
  await userEvent.keyboard('{Enter}');
  expect(submitted).not.toHaveBeenCalled();
  await expect.element(textBox()).toHaveValue('2026-13-40');
  await expect.element(textBox()).toHaveAttribute('aria-invalid', 'true');
  await expect.element(field()).toHaveAttribute('data-invalid');
  await userEvent.keyboard('{Escape}');
  await expect.element(textBox()).toHaveValue('2026.09.15');
  await expect.element(textBox()).not.toHaveAttribute('aria-invalid');
  await userEvent.fill(textBox(), '2026-09-25');
  textBox().blur();
  await expect.element(textBox()).toHaveAttribute('aria-invalid', 'true');
  expect(changes).toEqual([]);
  await userEvent.clear(textBox());
  textBox().blur();
  expect(changes).toEqual([null]);
});

test('a pasted or autofilled date is read at once; typing waits, and an IME Enter is ignored', async () => {
  const changes: (string | null | undefined)[] = [];
  await render(
    <DateField onValueChange={(next) => changes.push(keyOf(next))}>
      <DateField.Input />
    </DateField>,
  );
  await copy('2026년 9월 3일');
  await userEvent.type(textBox(), '2026-09-1');
  expect(changes).toEqual([]);
  textBox().select();
  await userEvent.paste();
  expect(changes).toEqual(['2026-09-03']);
  await expect.element(textBox()).toHaveValue('2026.09.03');
  autofill(textBox(), '2000-01-31');
  expect(changes).toEqual(['2026-09-03', '2000-01-31']);
  await userEvent.fill(textBox(), '2026. 9. 5');
  textBox().dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      isComposing: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(changes).toHaveLength(2);
  await userEvent.keyboard('{Enter}');
  expect(changes.at(-1)).toBe('2026-09-05');
});

test('typed entry and the calendar share one value; ArrowDown opens on the typed date', async () => {
  const changes: (string | null | undefined)[] = [];
  const screen = await render(
    <DateField today={d(15)} onValueChange={(next) => changes.push(keyOf(next))}>
      <DateField.Input />
      <DateField.Clear />
    </DateField>,
  );
  await userEvent.fill(textBox(), '2026-09-18');
  await userEvent.keyboard('{ArrowDown}');
  expect(changes).toEqual(['2026-09-18']);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await expect.element(day('2026-09-18')).toHaveFocus();
  await userEvent.click(day('2026-09-21'));
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(textBox()).toHaveValue('2026.09.21');
  await expect.element(textBox()).toHaveFocus();
  const button = screen.getByRole('button', { name: '달력 열기' });
  await userEvent.click(button);
  await expect.element(screen.getByRole('dialog')).toBeVisible();
  await expect.element(button).toHaveAttribute('aria-expanded', 'true');
  await expect.element(button).toHaveAttribute('aria-controls', popup()!.id);
  await userEvent.click(button);
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  await expect.element(button).toHaveAttribute('aria-expanded', 'false');
  await expect.element(button).not.toHaveAttribute('aria-controls');
  await userEvent.click(screen.getByRole('button', { name: '날짜 지우기' }));
  await expect.element(textBox()).toHaveValue('');
  expect(changes.at(-1)).toBeNull();
});

test('the calendar button beside an Input takes the field size and is disabled with the field', async () => {
  const screen = await render(
    <DateField size="tiny">
      <DateField.Input />
    </DateField>,
  );
  const button = screen.getByRole('button', { name: '달력 열기' });
  await expect.element(button).toHaveAttribute('data-size', 'tiny');
  await expect.element(button).toHaveClass('size-6');
  expect(button.element().className).not.toMatch(/-m[se]-/);
  await expect.element(button).not.toHaveAttribute('disabled');
  for (const props of [{ readOnly: true }, { disabled: true }]) {
    await screen.rerender(
      <DateField key={Object.keys(props)[0]} {...props}>
        <DateField.Input />
      </DateField>,
    );
    await expect.element(button).toHaveAttribute('disabled');
    await userEvent.click(button, { force: true });
    await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
  }
});

test('parts split across Fragments render without duplicate keys', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await render(
      <DateField aria-label="Day" defaultValue={new Date(2026, 8, 15)}>
        <Fragment>
          <DateField.Trigger />
        </Fragment>
        <Fragment>
          <DateField.Clear />
        </Fragment>
      </DateField>,
    );
    expect(clear()).not.toBeNull();
    expect(
      error.mock.calls.map((args) => args.join(' ')).filter((m) => m.includes('same key')),
    ).toEqual([]);
  } finally {
    error.mockRestore();
  }
});
