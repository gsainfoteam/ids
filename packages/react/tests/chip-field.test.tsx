import { renderToString } from 'react-dom/server';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { beforeEach, expect, test, vi } from 'vitest';
import { page, userEvent, type Locator } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ChipField, Field } from '../src';
import { Field as RHFField } from '../src/react-hook-form';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const items = (
  <>
    <ChipField.Group heading="Languages">
      <ChipField.Item value="js">JavaScript</ChipField.Item>
      <ChipField.Item value="ts">TypeScript</ChipField.Item>
    </ChipField.Group>
    <ChipField.Item value="no" disabled>
      Unavailable
    </ChipField.Item>
  </>
);

const optionId = (name: string) => page.getByRole('option', { name, exact: true }).element().id;

const removeButton = (label: string) =>
  page.getByRole('button', { name: `${label} 삭제`, exact: true });

const chips = () =>
  Array.from(document.querySelectorAll('[data-chip-field-chip]'), (chip) => chip.textContent);

const layout = (container: HTMLElement) =>
  Array.from(container.querySelector('[data-chip-field]')!.children, (element) =>
    element.hasAttribute('data-chip-field-adornment')
      ? element.textContent
      : element.hasAttribute('data-chip-field-chip')
        ? 'CHIP'
        : element.tagName.toUpperCase(),
  );

const settle = () => new Promise((resolve) => setTimeout(resolve));

async function paste(target: Locator, text: string) {
  const scratch = document.createElement('textarea');
  document.body.append(scratch);
  await userEvent.fill(scratch, text);
  scratch.select();
  await userEvent.copy();
  scratch.remove();
  (target.element() as HTMLElement).focus();
  await userEvent.paste();
}

beforeEach(async () => {
  await page.viewport(1024, 768);
});

test('SSR: Field labelling, one hidden input per chip, required validator, no nested buttons', () => {
  const doc = parse(
    renderToString(
      <form>
        <Field required>
          <Field.Label>Skills</Field.Label>
          <ChipField name="skills" defaultValue={['js', 'ts']}>
            {items}
          </ChipField>
        </Field>
      </form>,
    ),
  );
  const input = doc.querySelector<HTMLInputElement>('[role=combobox]')!;
  expect(doc.querySelector('label')!.htmlFor).toBe(input.id);
  expect(input.getAttribute('aria-required')).toBe('true');
  expect(input.hasAttribute('name')).toBe(false);
  expect(new FormData(doc.querySelector('form')!).getAll('skills')).toEqual(['js', 'ts']);
  expect(doc.querySelectorAll('[data-form-value-validator]')).toHaveLength(1);
  expect(doc.querySelector('button button')).toBeNull();
  const remove = doc.querySelector<HTMLButtonElement>('[data-chip-field-remove]')!;
  expect(remove.tabIndex).toBe(-1);
  expect(remove.closest('[data-chip-field-chip]')!.hasAttribute('data-chip')).toBe(true);
  expect(remove.hasAttribute('data-chip-close')).toBe(true);
  expect(remove.dataset.variant).toBe('ghost');
  const itemWithoutValue = (
    // @ts-expect-error An item needs a value.
    <ChipField.Item>Bad</ChipField.Item>
  );
  expect(() => renderToString(<ChipField>{itemWithoutValue}</ChipField>)).toThrow(
    /`value` is required/,
  );
});

test('search, groups, keyboard selection with a check, chip removal and maxCount', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <ChipField aria-label="Skills" maxCount={1} onValueChange={onValueChange}>
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  const listbox = screen.getByRole('listbox');
  await userEvent.fill(input, 'Type');
  expect(screen.getByRole('option').elements()).toHaveLength(1);
  await userEvent.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith(['ts']);
  await expect.element(input).toHaveValue('');
  await expect.element(listbox).toBeVisible();
  const ts = screen.getByRole('option', { name: 'TypeScript' });
  expect(ts.element().querySelector('[data-chip-field-item-indicator]')).not.toBeNull();
  await expect
    .element(screen.getByRole('option', { name: 'JavaScript' }))
    .toHaveAttribute('aria-disabled', 'true');
  await expect
    .element(screen.getByText('최대 1개까지 고를 수 있습니다.'))
    .toHaveAttribute('data-chip-field-limit');
  await expect
    .element(page.elementLocator(screen.container.querySelector('[data-chip-field]')!))
    .toHaveAttribute('data-full');
  await userEvent.keyboard('{Escape}');
  await expect.element(listbox).not.toBeInTheDocument();
  await userEvent.keyboard('{Backspace}');
  expect(onValueChange).toHaveBeenLastCalledWith([]);
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith(['js']);
  await userEvent.click(removeButton('JavaScript'));
  expect(onValueChange).toHaveBeenLastCalledWith([]);
  await expect.element(input).toHaveFocus();
});

test('arrow keys walk the chips; Backspace and Delete remove and keep focus nearby', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <ChipField
      aria-label="Skills"
      defaultValue={['js', 'ts', 'x', 'y']}
      onValueChange={onValueChange}
    >
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  await userEvent.keyboard('{Tab}');
  await expect.element(input).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(removeButton('y')).toHaveFocus();
  await expect
    .element(page.elementLocator(removeButton('y').element().closest('[data-chip]')!))
    .toHaveAttribute('data-focus-visible');
  await userEvent.keyboard('{ArrowLeft}');
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(removeButton('TypeScript')).toHaveFocus();
  await userEvent.keyboard('{Backspace}');
  expect(chips()).toEqual(['JavaScript', 'x', 'y']);
  await expect.element(removeButton('JavaScript')).toHaveFocus();
  await userEvent.keyboard('{Delete}');
  expect(chips()).toEqual(['x', 'y']);
  await expect.element(removeButton('x')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(input).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await userEvent.keyboard('{Home}');
  await expect.element(removeButton('x')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(input).toHaveFocus();
  expect((input.element() as HTMLInputElement).selectionStart).toBe(0);
  await userEvent.keyboard('{ArrowLeft}');
  await userEvent.click(removeButton('y'));
  expect(chips()).toEqual(['x']);
  await expect.element(input).toHaveFocus();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await expect.element(input).toHaveFocus();
  expect(onValueChange).toHaveBeenLastCalledWith(['x']);
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(removeButton('x')).toHaveFocus();
  await userEvent.keyboard('q');
  await expect.element(input).toHaveFocus();
  await expect.element(input).toHaveValue('q');
});

test('the container opens the list; PageDown jumps; an outside value may exceed maxCount', async () => {
  const screen = await render(
    <ChipField aria-label="Skills" value={['js', 'ts', 'x']} maxCount={2}>
      {items}
    </ChipField>,
  );
  expect(chips()).toEqual(['JavaScript', 'TypeScript', 'x']);
  const root = screen.container.querySelector<HTMLElement>('[data-chip-field]')!;
  await userEvent.click(page.elementLocator(root), {
    position: { x: 4, y: root.offsetHeight / 2 },
  });
  await expect.element(screen.getByRole('combobox', { name: 'Skills' })).toHaveFocus();
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  await screen.rerender(
    <div key="pages">
      <ChipField aria-label="Skills">{items}</ChipField>
    </div>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  await userEvent.keyboard('{Tab}');
  await expect.element(input).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{PageDown}');
  await expect.element(input).toHaveAttribute('aria-activedescendant', optionId('TypeScript'));
});

test('in a right-to-left field the arrows are mirrored', async () => {
  const screen = await render(
    <ChipField aria-label="Skills" defaultValue={['js', 'ts']} style={{ direction: 'rtl' }}>
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(removeButton('TypeScript')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(removeButton('JavaScript')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(input).toHaveFocus();
});

test('paste splits on commas and new lines, dedupes, and leaves what it cannot add', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <ChipField aria-label="Skills" defaultValue={['ts']} onValueChange={onValueChange}>
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  await paste(input, 'javascript, TYPESCRIPT\nUnavailable\tRust');
  expect(onValueChange).toHaveBeenLastCalledWith(['ts', 'js']);
  await expect.element(input).toHaveValue('Unavailable, Rust');
  await paste(input, 'Java');
  await expect.element(input).toHaveValue('Unavailable, RustJava');
  expect(onValueChange).toHaveBeenCalledTimes(1);
});

test('creatable: trims, dedupes, ignores IME, validates, and commits on comma or Enter', async () => {
  const onValueChange = vi.fn();
  const onCreate = vi.fn();
  const screen = await render(
    <ChipField
      aria-label="Skills"
      creatable
      maxCount={3}
      validate={(text) => text.length >= 2 || 'Too short'}
      onValueChange={onValueChange}
      onCreate={onCreate}
    >
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  const createRow = () => screen.container.querySelector('[data-chip-field-create]');
  await userEvent.fill(input, '  새 태그  ');
  input.element().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
  await userEvent.keyboard('{Enter}');
  expect(onCreate).not.toHaveBeenCalled();
  input.element().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
  await userEvent.keyboard('{Enter}');
  expect(onCreate.mock.calls).toEqual([['새 태그']]);
  expect(onValueChange).toHaveBeenLastCalledWith(['새 태그']);
  await userEvent.fill(input, '새 태그');
  expect(createRow()).toBeNull();
  await userEvent.fill(input, 'x');
  const invalid = screen.getByRole('option', { name: 'Too short', exact: true });
  await expect.element(invalid).toHaveAttribute('data-chip-field-create');
  await expect.element(invalid).toHaveAttribute('aria-disabled', 'true');
  await userEvent.keyboard('{Enter}');
  expect(onCreate).toHaveBeenCalledTimes(1);
  await userEvent.clear(input);
  await userEvent.keyboard(',');
  await expect.element(input).toHaveValue('');
  await userEvent.fill(input, 'Rust');
  await userEvent.keyboard(',');
  await expect.element(input).toHaveValue('');
  expect(onValueChange).toHaveBeenLastCalledWith(['새 태그', 'Rust']);
  await userEvent.fill(input, 'ＲＵＳＴ');
  expect(createRow()).toBeNull();
  await userEvent.fill(input, 'typescript');
  await userEvent.keyboard(',');
  expect(onValueChange).toHaveBeenLastCalledWith(['새 태그', 'Rust', 'ts']);
  await userEvent.fill(input, 'more');
  expect(createRow()).toBeNull();
  await screen.rerender(
    <div key="false">
      <ChipField aria-label="Skills" creatable validate={() => false}>
        {items}
      </ChipField>
    </div>,
  );
  await userEvent.fill(screen.getByRole('combobox', { name: 'Skills' }), 'anything');
  await expect
    .element(page.elementLocator(createRow()!))
    .toHaveTextContent('추가할 수 없는 값입니다.');
});

test('required is enforced natively; reset, prevented reset, read-only and disabled', async () => {
  const onValueChange = vi.fn();
  const view = (props: Partial<ChipField.Props>) => (
    <form onSubmit={(event) => event.preventDefault()}>
      <ChipField
        aria-label="Skills"
        name="skills"
        defaultValue={['js']}
        onValueChange={onValueChange}
        {...props}
      >
        <ChipField.Input asChild>
          <input data-test="search" />
        </ChipField.Input>
        <ChipField.Content>{items}</ChipField.Content>
      </ChipField>
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>
  );
  const screen = await render(view({ required: true }));
  const form = screen.container.querySelector('form')!;
  const input = screen.getByRole('combobox', { name: 'Skills' });
  const reset = screen.getByRole('button', { name: 'Reset' });
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{Backspace}');
  expect(form.checkValidity()).toBe(false);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await expect.element(input).toHaveFocus();
  form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
  await userEvent.click(reset);
  await settle();
  expect(new FormData(form).getAll('skills')).toEqual([]);
  await userEvent.fill(input, 'half typed');
  await userEvent.keyboard('{Escape}');
  await expect.element(input).toHaveValue('half typed');
  await userEvent.click(reset);
  await expect.poll(() => new FormData(form).getAll('skills')).toEqual(['js']);
  await expect.element(input).toHaveValue('');
  expect(onValueChange.mock.calls).toEqual([[[]]]);
  expect(form.checkValidity()).toBe(true);
  await screen.rerender(view({ readOnly: true, required: true }));
  (input.element() as HTMLInputElement).focus();
  await userEvent.keyboard('{Backspace}');
  await userEvent.click(input);
  await expect.element(screen.getByRole('listbox')).not.toBeInTheDocument();
  expect(screen.container.querySelector('[data-chip-field-remove]')).toBeNull();
  expect(new FormData(form).getAll('skills')).toEqual(['js']);
  await screen.rerender(view({ disabled: true }));
  await expect.element(input).toHaveAttribute('disabled');
  expect([...new FormData(form)]).toEqual([]);
});

test('open, defaultOpen and onOpenChange', async () => {
  const onOpenChange = vi.fn();
  const screen = await render(
    <ChipField aria-label="Skills" defaultOpen onOpenChange={onOpenChange}>
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  const listbox = screen.getByRole('listbox');
  await expect.element(listbox).toBeVisible();
  await userEvent.keyboard('{Tab}');
  await expect.element(input).toHaveFocus();
  await userEvent.keyboard('{Escape}');
  await expect.element(listbox).not.toBeInTheDocument();
  await userEvent.fill(input, 'Java');
  await expect.element(listbox).toBeVisible();
  await userEvent.keyboard('{Escape}');
  await expect.element(input).toHaveValue('Java');
  await userEvent.keyboard('{Escape}');
  await expect.element(input).toHaveValue('');
  expect(onOpenChange.mock.calls.flat()).toEqual([false, true, false]);
});

test('drawer: the sheet has its own search field, and closing returns to the field', async () => {
  await page.viewport(400, 700);
  const onValueChange = vi.fn();
  const screen = await render(
    <ChipField aria-label="Skills" onValueChange={onValueChange}>
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Skills' });
  await userEvent.click(input);
  const search = screen.getByRole('combobox', { name: '항목 검색' });
  await expect.element(search).toHaveAttribute('data-chip-field-search');
  expect(search.element().closest('[data-text-field]')).not.toBeNull();
  await expect.element(search).toHaveFocus();
  await expect
    .element(screen.getByRole('dialog', { name: 'Skills' }))
    .toHaveAttribute('aria-modal', 'true');
  await userEvent.fill(search, 'Java');
  await expect.element(search).toHaveValue('Java');
  expect(screen.getByRole('option').elements()).toHaveLength(1);
  await expect.element(search).toHaveAttribute('aria-activedescendant', optionId('JavaScript'));
  await userEvent.keyboard('{Enter}');
  expect(onValueChange).toHaveBeenLastCalledWith(['js']);
  await userEvent.keyboard('{Escape}');
  await expect.element(screen.getByRole('listbox')).not.toBeInTheDocument();
  await expect.element(input).toHaveFocus();
});

test('onBlur waits until focus leaves the field and its drawer', async () => {
  await page.viewport(400, 700);
  try {
    const onBlur = vi.fn();
    const screen = await render(
      <div>
        <ChipField aria-label="Skills" onBlur={onBlur}>
          {items}
        </ChipField>
        <button type="button">After</button>
      </div>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Skills' }));
    await expect.element(screen.getByRole('combobox', { name: '항목 검색' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.element(screen.getByRole('combobox', { name: 'Skills' })).toHaveFocus();
    expect(onBlur, 'focus only moved between the field and its sheet').not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(onBlur).toHaveBeenCalledOnce();
  } finally {
    await page.viewport(414, 896);
  }
});

test('react-hook-form value mode binds onValueChange; errors focus, reset, disabled omission', async () => {
  type Values = { tags: string[] };
  const submitted = vi.fn();
  let methods: UseFormReturn<Values> | undefined;
  function App({ disabled = false }: { disabled?: boolean }) {
    const form = useForm<Values>({ defaultValues: { tags: [] } });
    methods = form;
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(submitted)}>
          <RHFField
            name="tags"
            controlMode="value"
            disabled={disabled}
            registerOptions={{ validate: (value) => value.length > 0 || 'Required' }}
          >
            <RHFField.Label>Tags</RHFField.Label>
            <ChipField>{items}</ChipField>
            <RHFField.Error />
          </RHFField>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  const screen = await render(<App />);
  const input = screen.getByRole('combobox', { name: 'Tags' });
  const submit = screen.getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  await expect.element(input).toHaveFocus();
  await userEvent.fill(input, 'Type');
  await userEvent.keyboard('{Enter}');
  await userEvent.keyboard('{Escape}');
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.lastCall?.[0]).toEqual({ tags: ['ts'] });
  methods!.reset();
  await expect.poll(() => screen.container.querySelector('input[type=hidden]')).toBeNull();
  await screen.rerender(<App disabled />);
  await userEvent.click(submit);
  await expect.poll(() => submitted.mock.calls.length).toBe(2);
  expect(submitted.mock.lastCall?.[0].tags).toBeUndefined();
});

test('Input values win over root values, but root and Input handlers both run', async () => {
  const keys: string[] = [];
  const screen = await render(
    <ChipField
      id="root-id"
      placeholder="root"
      spellCheck={false}
      onKeyDown={() => keys.push('root')}
    >
      <ChipField.Input placeholder="input" onKeyDown={() => keys.push('input')} />
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox');
  await expect.element(input).toHaveAttribute('id', 'root-id');
  await expect.element(input).toHaveAttribute('placeholder', 'input');
  await expect.element(input).toHaveAttribute('spellcheck', 'false');
  await userEvent.keyboard('{Tab}');
  await userEvent.keyboard('{ArrowDown}');
  expect(keys).toEqual(['root', 'input']);
  await expect.element(screen.getByRole('listbox')).toBeVisible();
  await expect.element(input).toHaveAttribute('aria-expanded', 'true');
});

test('without an Input, leading children come before the chips and the Input is appended', async () => {
  const screen = await render(
    <ChipField aria-label="Tags" defaultValue={['js']}>
      <span>Lead</span>
      {items}
    </ChipField>,
  );
  expect(layout(screen.container)).toEqual(['Lead', 'CHIP', 'INPUT', 'SVG']);
  expect(screen.getByRole('combobox', { name: 'Tags' }).element().tagName).toBe('INPUT');
});

test('Input inside a Fragment splits leading and trailing adornments', async () => {
  const screen = await render(
    <ChipField aria-label="Tags" defaultValue={['js']}>
      <>
        <span>Lead</span>
        <ChipField.Input />
        <span>Trail</span>
      </>
      {items}
    </ChipField>,
  );
  expect(layout(screen.container)).toEqual(['Lead', 'CHIP', 'INPUT', 'Trail', 'SVG']);
});

test('a field that only creates values has no chevron', async () => {
  const screen = await render(<ChipField aria-label="Emails" creatable />);
  expect(layout(screen.container)).toEqual(['INPUT']);
});

test('asChild merges props, handlers and ref into the child input', async () => {
  let node: HTMLInputElement | null = null;
  const keys: string[] = [];
  const screen = await render(
    <ChipField
      aria-label="Tags"
      onKeyDown={() => keys.push('root')}
      ref={(value) => {
        node = value;
      }}
    >
      <ChipField.Input asChild>
        <input spellCheck={false} onKeyDown={() => keys.push('child')} />
      </ChipField.Input>
      {items}
    </ChipField>,
  );
  const input = screen.getByRole('combobox', { name: 'Tags' });
  expect(node).toBe(input.element());
  await expect.element(input).toHaveAttribute('spellcheck', 'false');
  await expect.element(input).toHaveAttribute('data-chip-field-input');
  await userEvent.fill(input, 'Type');
  await userEvent.keyboard('{Enter}');
  expect(keys).toEqual(['child', 'root']);
  await expect.element(removeButton('TypeScript')).toBeInTheDocument();
});

test('invalid structures fail clearly', () => {
  for (const node of [
    <ChipField>
      <ChipField.Input />
      <ChipField.Input />
    </ChipField>,
    <ChipField>
      <ChipField.Input asChild>
        <textarea />
      </ChipField.Input>
    </ChipField>,
    <ChipField>
      <ChipField.Input>text</ChipField.Input>
    </ChipField>,
    <ChipField.Input />,
    <ChipField>
      <ChipField.Content />
      <ChipField.Item value="x">X</ChipField.Item>
    </ChipField>,
  ])
    expect(() => renderToString(node)).toThrow(/\[IDS\] `<ChipField/);
});
