import { useState, type FormEvent } from 'react';

import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { beforeEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Field, Select } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const items = (
  <>
    <Select.Item value="apple">Apple</Select.Item>
    <Select.Item value="banana" disabled>
      Banana
    </Select.Item>
    <Select.Item value="cherry">Cherry</Select.Item>
  </>
);

const optionId = (name: string) => page.getByRole('option', { name, exact: true }).element().id;

const fruits = (count: number) =>
  Array.from({ length: count }, (_, index) => `Fruit ${index + 1}`).map((fruit) => (
    <Select.Item key={fruit} value={fruit}>
      {fruit}
    </Select.Item>
  ));

const settle = () => new Promise((resolve) => setTimeout(resolve));

beforeEach(async () => {
  await page.viewport(1024, 768);
});

test('SSR: Field labelling, size, invalid, one hidden input per value and diagnostics', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field size="tiny" invalid required>
          <Field.Label>Fruit</Field.Label>
          <Select name="fruit" selectionMode="multiple" defaultValue={['cherry', 'apple']}>
            {items}
          </Select>
          <Field.Error>Error</Field.Error>
        </Field>
      </form>,
    ),
  );
  const button = doc.querySelector<HTMLButtonElement>('[role=combobox]')!;
  expect(button.id).toBe(doc.querySelector('label')!.htmlFor);
  expect(button.type).toBe('button');
  expect(button.getAttribute('aria-invalid')).toBe('true');
  expect(button.getAttribute('aria-required')).toBe('true');
  expect(button.getAttribute('aria-haspopup')).toBe('listbox');
  expect(button.textContent).toContain('Cherry, Apple');
  const root = doc.querySelector<HTMLElement>('[data-select]')!;
  expect(root.dataset.size).toBe('tiny');
  expect(root.hasAttribute('data-invalid')).toBe(true);
  expect([...new FormData(doc.querySelector('form')!)]).toEqual([
    ['fruit', 'cherry'],
    ['fruit', 'apple'],
  ]);
  expect(doc.querySelectorAll('[data-form-value-validator]')).toHaveLength(1);
  expect(() =>
    renderToString(
      <Select>
        <Select.Item value="a" />
        <Select.Item value="a" />
      </Select>,
    ),
  ).toThrow(/duplicate/);
  // @ts-expect-error A multiple Select takes string[], not a string.
  expect(() => renderToString(<Select selectionMode="multiple" value="bad" />)).toThrow(/string/);
  expect(() =>
    renderToString(
      <Select>
        <Select.Content />
        <Select.Item value="x">X</Select.Item>
      </Select>,
    ),
  ).toThrow(/either inside Select.Content or directly/);
});

test('keyboard: opens on the selection, skips disabled items, does not wrap, pages and commits', async () => {
  const onValueChange = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(
    <Select
      aria-label="Fruit"
      defaultValue="cherry"
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
    >
      {items}
    </Select>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  const listbox = screen.getByRole('listbox');
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(listbox).toBeVisible();
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Apple'));
  await userEvent.keyboard('{PageDown}');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
  await userEvent.keyboard('{Home}');
  await userEvent.keyboard('{Enter}');
  expect(onValueChange.mock.calls).toEqual([['apple']]);
  await expect.element(listbox).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
  await userEvent.keyboard('{Escape}');
  await expect.element(listbox).not.toBeInTheDocument();
  expect(onValueChange.mock.calls).toEqual([['apple']]);
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
  expect(onValueChange.mock.calls).toEqual([['apple'], ['cherry']]);
  await expect.element(listbox).not.toBeInTheDocument();
  expect(onOpenChange.mock.calls.flat()).toEqual([true, false, true, false, true, false]);
});

test('typeahead: a typed prefix jumps, a repeated letter cycles, a space continues the prefix', async () => {
  const screen = await render(
    <Select aria-label="Fruit">
      <Select.Item value="b1">Blueberry</Select.Item>
      <Select.Item value="b2">Banana</Select.Item>
      <Select.Item value="n1">New York</Select.Item>
      <Select.Item value="n2">New Delhi</Select.Item>
      <Select.Item value="b3">Blackberry</Select.Item>
    </Select>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('b');
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Banana'));
  await userEvent.keyboard('b');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Blackberry'));
  await userEvent.keyboard('b');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Blueberry'));
  await new Promise((resolve) => setTimeout(resolve, 550));
  await userEvent.keyboard('new d');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('New Delhi'));
});

test('search, live empty state, multiple toggles in list order, outside dismissal and reset', async () => {
  const onValueChange = vi.fn();
  const onOpenChange = vi.fn();
  const onBlur = vi.fn();
  const screen = await render(
    <>
      <p>Outside</p>
      <form>
        <Select
          aria-label="Fruit"
          name="fruit"
          selectionMode="multiple"
          defaultValue={['apple']}
          onValueChange={onValueChange}
          onOpenChange={onOpenChange}
          onBlur={onBlur}
        >
          <Select.SearchField />
          {items}
          <Select.Empty>No fruit</Select.Empty>
        </Select>
        <button type="reset">Reset</button>
      </form>
    </>,
  );
  const form = screen.container.querySelector('form')!;
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  const listbox = screen.getByRole('listbox');
  await userEvent.click(trigger);
  const search = screen.getByRole('combobox', { name: '옵션 검색' });
  await expect.element(search).toHaveFocus();
  await expect.element(search).toHaveAttribute('data-select-search');
  const shell = page.elementLocator(search.element().closest('[data-text-field]')!);
  await expect.element(shell).toHaveAttribute('data-variant', 'ghost');
  await expect.element(shell).toHaveClass('border-b', 'ring-0!');
  const status = screen.getByRole('status');
  await expect.element(status).toHaveTextContent('');
  await userEvent.fill(search, 'xyz');
  await expect.element(status).toHaveTextContent('No fruit');
  expect(screen.getByRole('option').elements()).toHaveLength(0);
  await userEvent.fill(search, 'CH');
  await expect.element(search).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
  await userEvent.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry']);
  await expect.element(listbox).toBeVisible();
  await userEvent.clear(search);
  await userEvent.click(screen.getByRole('option', { name: 'Banana' }), { force: true });
  expect(onValueChange).toHaveBeenCalledTimes(1);
  await expect
    .element(search, { message: 'a press on a disabled option keeps focus in the search' })
    .toHaveFocus();
  await userEvent.click(screen.getByRole('option', { name: 'Apple' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['cherry']);
  await userEvent.click(screen.getByRole('option', { name: 'Apple' }));
  expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'cherry']);
  await userEvent.keyboard('{Tab}');
  await expect.element(listbox).not.toBeInTheDocument();
  expect(onBlur, 'Tab out of the popup leaves the field').toHaveBeenCalledOnce();
  const reportedBeforeReset = onValueChange.mock.calls.length;
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  await expect.poll(() => new FormData(form).getAll('fruit')).toEqual(['apple']);
  expect(onValueChange).toHaveBeenCalledTimes(reportedBeforeReset);
  await userEvent.click(trigger);
  await expect.element(listbox).toBeVisible();
  await userEvent.click(screen.getByText('Outside'));
  await expect.element(listbox).not.toBeInTheDocument();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
  expect(
    onBlur,
    'a press outside while the search has focus leaves the field',
  ).toHaveBeenCalledTimes(2);
});

test('options show a check when selected, and state reaches data attributes and functions', async () => {
  const screen = await render(
    <Select aria-label="Status" defaultValue="b" defaultOpen>
      <Select.Item value="a">A</Select.Item>
      <Select.Item value="b" className={(state) => (state.selected ? 'is-selected' : 'is-not')}>
        {(state) => `B ${state.highlighted ? 'lit' : 'dark'}`}
      </Select.Item>
      <Select.Item value="c" label="C">
        Custom
        <Select.ItemIndicator className="mine">*</Select.ItemIndicator>
      </Select.Item>
    </Select>,
  );
  const a = screen.getByRole('option', { name: 'A', exact: true });
  const b = screen.getByRole('option', { name: 'B lit', exact: true });
  expect(a.element().querySelector('[data-select-item-indicator]')).toBeNull();
  expect(b.element().querySelector('[data-select-item-indicator] svg')).not.toBeNull();
  await expect.element(b).toHaveAttribute('data-selected');
  await expect.element(b).toHaveAttribute('data-highlighted');
  await expect.element(b).toHaveClass('is-selected');
  expect(b.element().firstChild?.textContent).toBe('B lit');
  await userEvent.click(screen.getByRole('option', { name: 'Custom' }));
  const trigger = screen.getByRole('combobox', { name: 'Status' });
  await expect.element(trigger).toHaveTextContent('C');
  await userEvent.click(trigger);
  const custom = screen.getByRole('option', { name: 'Custom' }).element();
  const indicators = custom.querySelectorAll('[data-select-item-indicator]');
  expect(indicators).toHaveLength(1);
  expect(indicators[0].classList.contains('mine')).toBe(true);
});

test('multiple values read as two labels and a count that never truncates', async () => {
  const screen = await render(
    <Select aria-label="Fruits" selectionMode="multiple" defaultValue={['a', 'b', 'c', 'd']}>
      {['a', 'b', 'c', 'd'].map((value) => (
        <Select.Item key={value} value={value}>
          {value.toUpperCase()}
        </Select.Item>
      ))}
    </Select>,
  );
  const value = screen.container.querySelector('[data-select-value]')!;
  expect(value.children[0].textContent).toBe('A, B');
  expect(value.children[1].textContent).toBe('+2');
  await screen.rerender(
    <Select key="custom" aria-label="Fruits" selectionMode="multiple" defaultValue={['a']}>
      <Select.Trigger>
        <Select.Value>{(state) => `${state.labels.length} picked`}</Select.Value>
      </Select.Trigger>
      <Select.Item value="a">A</Select.Item>
    </Select>,
  );
  await expect.element(screen.getByRole('combobox')).toHaveTextContent('1 picked');
});

test('Clear returns a single select to null and focuses the trigger; hidden when read-only', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Select aria-label="Fruit" defaultValue="apple" onValueChange={onValueChange}>
      <Select.Clear />
      {items}
    </Select>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  const clear = screen.getByRole('button', { name: '선택 지우기' });
  await expect.element(clear).toHaveAttribute('type', 'button');
  await expect.element(clear).toHaveAttribute('data-variant', 'ghost');
  await expect.element(clear).toHaveClass('size-7', 'me-1');
  await userEvent.keyboard('{Tab}');
  await expect.element(trigger).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(clear).toHaveFocus();
  await userEvent.click(clear);
  expect(onValueChange.mock.calls).toEqual([[null]]);
  await expect.element(trigger).toHaveFocus();
  await expect.element(clear).not.toBeInTheDocument();
  await expect.element(trigger).toHaveTextContent('선택하세요');
  await screen.rerender(
    <Select aria-label="Fruit" value="apple" readOnly>
      <Select.Clear />
      {items}
    </Select>,
  );
  await expect.element(trigger).toHaveTextContent('Apple');
  await expect.element(clear).not.toBeInTheDocument();
});

test('required is enforced natively and the browser is sent to the trigger', async () => {
  const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
  const screen = await render(
    <form onSubmit={onSubmit}>
      <Select aria-label="Fruit" name="fruit" required>
        {items}
      </Select>
      <button type="submit">Submit</button>
    </form>,
  );
  const form = screen.container.querySelector('form')!;
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  const validator = screen.container.querySelector<HTMLInputElement>(
    '[data-form-value-validator]',
  )!;
  expect(form.checkValidity()).toBe(false);
  expect(validator.validity.valueMissing).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(onSubmit).not.toHaveBeenCalled();
  await expect.element(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('option', { name: 'Apple' }));
  expect(form.checkValidity()).toBe(true);
  expect([...new FormData(form)]).toEqual([['fruit', 'apple']]);
  await screen.rerender(
    <form>
      <Select aria-label="Fruit" required readOnly>
        {items}
      </Select>
    </form>,
  );
  expect(screen.container.querySelector('form')!.checkValidity()).toBe(true);
});

test('open, defaultOpen and onOpenChange; disabled and read-only never open', async () => {
  function Controlled() {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <button onClick={() => setOpen(true)}>Open</button>
        <Select aria-label="Fruit" open={open} onOpenChange={setOpen}>
          {items}
        </Select>
      </div>
    );
  }
  const screen = await render(<Controlled />);
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  const listbox = screen.getByRole('listbox');
  await expect.element(listbox).toBeVisible();
  trigger.element().focus();
  await userEvent.keyboard('{Escape}');
  await expect.element(listbox).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Open' }));
  await expect.element(listbox).toBeVisible();
  const onValueChange = vi.fn();
  await screen.rerender(
    <Select aria-label="Fruit" readOnly value="apple" onValueChange={onValueChange}>
      {items}
    </Select>,
  );
  await userEvent.click(trigger);
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(listbox).not.toBeInTheDocument();
  await expect.element(trigger).toHaveAttribute('aria-readonly', 'true');
  await screen.rerender(
    <Select aria-label="Fruit" disabled value="cherry" defaultOpen onValueChange={onValueChange}>
      {items}
    </Select>,
  );
  await expect.element(trigger).toHaveAttribute('disabled');
  await expect.element(listbox).not.toBeInTheDocument();
  await expect.element(trigger).toHaveTextContent('Cherry');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('an outside press reports one close even though it also moves focus', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <div>
      <button>Outside</button>
      <button>Other</button>
      <Select aria-label="Fruit" open onOpenChange={onOpenChange} />
    </div>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
  expect(onOpenChange.mock.calls).toEqual([[false]]);
  await expect.element(screen.getByRole('listbox')).toBeInTheDocument();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: 'Other' })).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
});

test('react-hook-form value mode binds onValueChange, focuses on error, resets and omits disabled', async () => {
  type Values = { fruit: string | null };
  const submitted = vi.fn();
  let methods: UseFormReturn<Values> | undefined;
  function App({ disabled = false }: { disabled?: boolean }) {
    const form = useForm<Values>({ defaultValues: { fruit: null } });
    methods = form;
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(submitted)}>
          <RHFField
            name="fruit"
            controlMode="value"
            registerOptions={{ required: 'Choose fruit' }}
            disabled={disabled}
          >
            <RHFField.Label>Fruit</RHFField.Label>
            <Select>{items}</Select>
            <RHFField.Error />
          </RHFField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  const submit = screen.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.element(trigger).toHaveFocus();
  await expect
    .element(screen.getByText('Choose fruit'))
    .toHaveAttribute('data-field-part', 'error');
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('option', { name: 'Apple' }));
  expect(methods!.getValues('fruit')).toBe('apple');
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.lastCall?.[0]).toEqual({ fruit: 'apple' });
  methods!.reset();
  await expect.element(trigger).toHaveTextContent('선택하세요');
  methods!.setValue('fruit', 'cherry');
  await expect.element(trigger).toHaveTextContent('Cherry');
  await screen.rerender(<App disabled />);
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.calls.length).toBe(2);
  expect(submitted.mock.lastCall?.[0].fruit).toBeUndefined();
});

test('asChild Content and Group still collect items; an empty string is a value', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Select aria-label="Fruit" onValueChange={onValueChange}>
      <Select.Trigger asChild>
        <button>Open</button>
      </Select.Trigger>
      <Select.Content asChild>
        <section>
          <Select.Group heading="Values" asChild>
            <section>
              <Select.Item value="">Empty</Select.Item>
            </section>
          </Select.Group>
        </section>
      </Select.Content>
    </Select>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
  expect(screen.getByRole('option').elements()).toHaveLength(1);
  expect(screen.getByRole('group', { name: 'Values' }).element().tagName).toBe('SECTION');
  await userEvent.keyboard('{Enter}');
  expect(onValueChange.mock.calls).toEqual([['']]);
  await expect.element(screen.getByRole('listbox')).not.toBeInTheDocument();
});

const CLEAR_OF_THE_LIST_FADE = 24;

test('the list opens centered on the selection and later moves scroll only the popup', async () => {
  const screen = await render(
    <Select aria-label="Fruit" defaultValue="Fruit 15">
      {fruits(30)}
    </Select>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  await userEvent.click(trigger);
  const list = screen.getByRole('listbox').element();
  const option = (name: string) =>
    page.getByRole('option', { name, exact: true }).element() as HTMLElement;
  const view = () => {
    const bounds = list.getBoundingClientRect();
    const top = bounds.top + list.clientTop;
    return { top, center: top + list.clientHeight / 2 };
  };
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  await expect
    .poll(() => {
      const bounds = option('Fruit 15').getBoundingClientRect();
      return Math.abs((bounds.top + bounds.bottom) / 2 - view().center);
    })
    .toBeLessThanOrEqual(1);
  expect(list.scrollTop).toBeGreaterThan(0);
  list.scrollTop = option('Fruit 15').offsetTop;
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(trigger).toHaveAttribute('aria-activedescendant', optionId('Fruit 14'));
  expect(
    Math.abs(option('Fruit 14').getBoundingClientRect().top - view().top - CLEAR_OF_THE_LIST_FADE),
  ).toBeLessThanOrEqual(1);
});

test('the popup flips above a trigger near the bottom, stays on screen and leaves with its trigger', async () => {
  const screen = await render(
    <div style={{ height: 2000 }}>
      <div style={{ position: 'absolute', top: 500, left: 900, width: 200 }}>
        <Select aria-label="Fruit">
          <Select.SearchField />
          {fruits(8)}
        </Select>
      </div>
    </div>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
  const anchor = screen.container.querySelector('[data-select]')!;
  const popup = screen.container.querySelector<HTMLElement>('[data-field-popup]')!;
  const viewportWidth = document.documentElement.clientWidth;
  const gapAboveAnchor = () =>
    anchor.getBoundingClientRect().top - popup.getBoundingClientRect().bottom;
  await expect.element(page.elementLocator(popup)).toHaveAttribute('data-side', 'top');
  await expect.poll(gapAboveAnchor).toBeCloseTo(4, 0);
  expect(popup.getBoundingClientRect().height).toBeGreaterThan(
    window.innerHeight - 8 - anchor.getBoundingClientRect().bottom - 4,
  );
  expect(popup.getBoundingClientRect().width).toBe(240);
  expect(popup.getBoundingClientRect().right).toBe(viewportWidth - 8);
  const tallHeight = popup.getBoundingClientRect().height;
  await userEvent.fill(screen.getByRole('combobox', { name: '옵션 검색' }), 'Fruit 3');
  await expect.poll(() => popup.getBoundingClientRect().height).toBeLessThan(tallHeight);
  expect(popup.getBoundingClientRect().height).toBeLessThan(
    window.innerHeight - 8 - anchor.getBoundingClientRect().bottom - 4,
  );
  await expect.element(page.elementLocator(popup)).toHaveAttribute('data-side', 'top');
  await expect.poll(gapAboveAnchor).toBeCloseTo(4, 0);
  window.scrollTo(0, 900);
  await expect.poll(() => anchor.getBoundingClientRect().bottom).toBeLessThan(0);
  await expect.poll(() => popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(0);
});

test('drawer on a small screen is a modal dialog: backdrop, focus inside, Tab held, scroll locked', async () => {
  await page.viewport(400, 700);
  const onValueChange = vi.fn();
  const pressedUnderneath = vi.fn();
  const screen = await render(
    <div>
      <button onClick={pressedUnderneath}>Before</button>
      <Select
        aria-label="Fruit"
        mobileVariant="drawer"
        defaultValue="cherry"
        onValueChange={onValueChange}
      >
        {items}
      </Select>
    </div>,
  );
  const before = screen.getByRole('button', { name: 'Before' }).element();
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  await userEvent.click(trigger);
  const sheet = screen.getByRole('dialog', { name: 'Fruit' });
  await expect.element(sheet).toHaveAttribute('data-presentation', 'drawer');
  await expect.element(sheet).toHaveAttribute('aria-modal', 'true');
  const bounds = sheet.element().getBoundingClientRect();
  expect([
    bounds.left,
    window.innerWidth - bounds.right,
    window.innerHeight - bounds.bottom,
  ]).toEqual([8, 8, 8]);
  const backdrop = screen.container.querySelector<HTMLElement>('[data-field-popup-backdrop]')!;
  await expect.element(page.elementLocator(backdrop)).toBeVisible();
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(true);
  const listbox = screen.getByRole('listbox');
  await expect.element(listbox).toHaveFocus();
  await expect.element(listbox).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(listbox).toHaveAttribute('aria-activedescendant', optionId('Apple'));
  await userEvent.keyboard('{Tab}');
  await expect.element(listbox).toHaveFocus();
  before.focus();
  await expect.element(listbox).toHaveFocus();
  backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  await settle();
  await expect.element(listbox).toBeVisible();
  const target = before.getBoundingClientRect();
  await userEvent.click(page.elementLocator(backdrop), {
    position: { x: target.left + target.width / 2, y: target.top + target.height / 2 },
  });
  await expect.element(listbox).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  expect(pressedUnderneath).not.toHaveBeenCalled();
  expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
  expect(onValueChange).not.toHaveBeenCalled();
});

test('search ignores case, width and accents; IME keys are left alone', async () => {
  const screen = await render(
    <Select aria-label="Country">
      <Select.SearchField />
      <Select.Item value="ci">Côte d&apos;Ivoire</Select.Item>
      <Select.Item value="cu">Cuba</Select.Item>
    </Select>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Country' }));
  const search = screen.getByRole('combobox', { name: '옵션 검색' });
  const shown = () =>
    screen
      .getByRole('option')
      .elements()
      .map((option) => option.textContent);
  await userEvent.fill(search, 'COTE');
  expect(shown()).toEqual(["Côte d'Ivoire"]);
  await userEvent.fill(search, 'ｃｕｂａ');
  expect(shown()).toEqual(['Cuba']);
  await userEvent.clear(search);
  const before = search.element().getAttribute('aria-activedescendant')!;
  for (const composing of [{ isComposing: true }, { keyCode: 229 }])
    search.element().dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
        ...composing,
      }),
    );
  await settle();
  await expect.element(search).toHaveAttribute('aria-activedescendant', before);
});

test('Separator is a decorative Divider, left out while searching', async () => {
  const screen = await render(
    <Select aria-label="Letter">
      <Select.SearchField />
      <Select.Item value="a">Alpha</Select.Item>
      <Select.Separator />
      <Select.Item value="b">Beta</Select.Item>
    </Select>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Letter' }));
  const rule = screen.container.querySelector('[data-select-separator]')!;
  expect(rule.hasAttribute('data-divider')).toBe(true);
  expect(rule.getAttribute('aria-hidden')).toBe('true');
  expect(rule.hasAttribute('role')).toBe(false);
  expect(rule.classList.contains('w-auto')).toBe(true);
  expect(rule.getBoundingClientRect().width).toBe(
    screen.getByRole('listbox').element().getBoundingClientRect().width,
  );
  await userEvent.fill(screen.getByRole('combobox', { name: '옵션 검색' }), 'a');
  expect(screen.container.querySelector('[data-select-separator]')).toBeNull();
});

test('SearchField keeps its own props, handlers and an asChild input under the combobox wiring', async () => {
  const keys: string[] = [];
  const screen = await render(
    <Select aria-label="Fruit">
      <Select.SearchField
        asChild
        autoComplete="on"
        aria-label="Find"
        onKeyDown={() => keys.push('own')}
      >
        <input data-test="mine" />
      </Select.SearchField>
      {items}
    </Select>,
  );
  await userEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
  const search = screen.getByRole('combobox', { name: 'Find' });
  await expect.element(search).toHaveFocus();
  await expect.element(search).toHaveAttribute('data-test', 'mine');
  await expect.element(search).toHaveAttribute('autocomplete', 'on');
  await userEvent.keyboard('{ArrowDown}');
  expect(keys).toEqual(['own']);
  await expect.element(search).toHaveAttribute('aria-activedescendant', optionId('Cherry'));
});

test('the list is named by the field label; onBlur waits until focus leaves trigger and popup', async () => {
  const onBlur = vi.fn();
  const screen = await render(
    <div>
      <Field>
        <Field.Label>Fruit</Field.Label>
        <Select onBlur={onBlur}>
          <Select.SearchField />
          {items}
        </Select>
      </Field>
      <button>After</button>
    </div>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Fruit' });
  await userEvent.keyboard('{Tab}');
  await expect.element(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await expect.element(screen.getByRole('combobox', { name: '옵션 검색' })).toHaveFocus();
  const listbox = screen.getByRole('listbox');
  await expect
    .element(listbox)
    .toHaveAttribute('aria-labelledby', screen.container.querySelector('label')!.id);
  await expect.element(listbox).toHaveAccessibleName('Fruit');
  expect(onBlur).not.toHaveBeenCalled();
  screen.getByRole('button', { name: 'After' }).element().focus();
  await expect.element(listbox).not.toBeInTheDocument();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

test('form attribute, disabled omission and a value that is not an option yet', async () => {
  const screen = await render(
    <div>
      <form id="outer" />
      <Select aria-label="Fruit" name="fruit" form="outer" defaultValue="apple">
        {items}
      </Select>
      <Select aria-label="Later" defaultValue="durian">
        {items}
      </Select>
    </div>,
  );
  expect([...new FormData(screen.container.querySelector('form')!)]).toEqual([['fruit', 'apple']]);
  await expect.element(screen.getByRole('combobox', { name: 'Later' })).toHaveTextContent('durian');
  await screen.rerender(
    <form key="disabled">
      <Select aria-label="Fruit" name="fruit" disabled defaultValue="apple">
        {items}
      </Select>
    </form>,
  );
  expect([...new FormData(screen.container.querySelector('form')!)]).toEqual([]);
});
