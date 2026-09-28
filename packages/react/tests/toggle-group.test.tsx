import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Toggle, ToggleGroup } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

type ItemProps = Omit<Toggle.Props, 'value' | 'children'>;

function group(
  props: ToggleGroup.Props = {},
  values = ['a', 'b', 'c'],
  itemProps: Record<string, ItemProps> = {},
) {
  return (
    <ToggleGroup aria-label="그룹" {...props}>
      {values.map((value) => (
        <Toggle key={value} value={value} {...itemProps[value]}>
          {value}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

const items = () => [
  ...document.body.querySelectorAll<HTMLButtonElement>('[data-toggle-group-item]'),
];
const radio = (name: string) => page.getByRole('radio', { name, exact: true });
const button = (name: string) => page.getByRole('button', { name, exact: true });

test('SSR: a single group is a named radiogroup; every item stays tabbable until measured', () => {
  const doc = parse(renderToString(group({ defaultValue: 'b', name: 'pick' })));
  const radiogroup = doc.querySelector('[role="radiogroup"]')!;
  expect(radiogroup.getAttribute('aria-label')).toBe('그룹');
  expect(radiogroup.getAttribute('aria-orientation')).toBe('horizontal');
  const radios = [...doc.querySelectorAll('[role="radio"]')];
  expect(radios.map((item) => item.getAttribute('aria-checked'))).toEqual([
    'false',
    'true',
    'false',
  ]);
  expect(radios[0].hasAttribute('aria-pressed')).toBe(false);
  expect(radios[0].hasAttribute('tabindex')).toBe(false);
  expect(doc.querySelector<HTMLInputElement>('input[type="hidden"][name="pick"]')!.value).toBe('b');
});

test('single: Tab lands on the checked item, or the first enabled one', async () => {
  const screen = await render(group({ defaultValue: 'b' }));
  expect(items().map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
  await userEvent.keyboard('{Tab}');
  await expect.element(radio('b')).toHaveFocus();
  await screen.rerender(null);
  await screen.rerender(group({}, ['a', 'b', 'c'], { a: { disabled: true } }));
  expect(items().map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  await userEvent.keyboard('{Tab}');
  await expect.element(radio('b')).toHaveFocus();
});

test('single: arrow keys move focus and the check together, skip disabled items and loop', async () => {
  const onValueChange = vi.fn();
  const onClick = vi.fn();
  await render(
    group({ defaultValue: 'a', onValueChange }, ['a', 'b', 'c', 'd'], {
      b: { disabled: true },
      c: { onClick },
    }),
  );
  radio('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(radio('c')).toHaveFocus();
  await expect.element(radio('c')).toHaveAttribute('aria-checked', 'true');
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(radio('d')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(radio('a')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(radio('d')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(radio('a')).toHaveFocus();
  expect(onValueChange.mock.calls).toEqual([['c'], ['d'], ['a'], ['d'], ['a']]);
  expect(onClick).toHaveBeenCalledOnce();
  await userEvent.keyboard('{Control>}{ArrowRight}{/Control}');
  await expect.element(radio('a')).toHaveFocus();
});

test('an inert item is passed over like a disabled one', async () => {
  await render(group({ defaultValue: 'a' }, ['a', 'b', 'c'], { b: { inert: true } }));
  radio('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(radio('c')).toHaveFocus();
});

test('loop={false} stops at the ends, and the arrow key is still consumed', async () => {
  const consumed: boolean[] = [];
  await render(
    <div onKeyDown={(event) => consumed.push(event.defaultPrevented)}>
      {group({ defaultValue: 'c', loop: false })}
    </div>,
  );
  radio('c').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(radio('c')).toHaveFocus();
  expect(consumed).toEqual([true]);
});

test('right-to-left swaps the left and right arrows', async () => {
  await render(<div dir="rtl">{group({ defaultValue: 'a' })}</div>);
  radio('a').element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(radio('b')).toHaveFocus();
});

test('single: clicking the checked item clears it unless the group is required', async () => {
  const onValueChange = vi.fn();
  const screen = await render(group({ defaultValue: 'a', onValueChange }));
  await userEvent.click(radio('a'));
  await expect.element(radio('a')).toHaveAttribute('aria-checked', 'false');
  expect(onValueChange.mock.calls).toEqual([[null]]);
  await screen.rerender(null);
  await screen.rerender(group({ defaultValue: 'a', required: true }));
  await expect.element(radio('a')).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(radio('a'));
  await expect.element(radio('a')).toHaveAttribute('aria-checked', 'true');
});

test('multiple: a toolbar of pressed buttons whose arrows move focus only', async () => {
  const onValueChange = vi.fn();
  const screen = await render(group({ selectionMode: 'multiple', onValueChange }));
  await expect.element(screen.getByRole('toolbar', { name: '그룹' })).toBeInTheDocument();
  await expect.element(button('a')).toHaveAttribute('aria-pressed', 'false');
  await expect.element(button('a')).not.toHaveAttribute('role');
  button('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(button('b')).toHaveFocus();
  await expect.element(button('b')).toHaveAttribute('aria-pressed', 'false');
  expect(items().map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(button('b')).toHaveFocus();
  await userEvent.click(button('c'));
  await userEvent.click(button('a'));
  expect(onValueChange.mock.calls).toEqual([[['c']], [['a', 'c']]]);
});

test('vertical toolbar moves on up and down only', async () => {
  await render(group({ selectionMode: 'multiple', orientation: 'vertical' }));
  button('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(button('a')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(button('b')).toHaveFocus();
});

test('controlled: null clears a single group', async () => {
  function Controlled() {
    const [value, setValue] = useState<string | null>('a');
    return (
      <div>
        {group({ value, onValueChange: setValue })}
        <button onClick={() => setValue(null)}>clear</button>
      </div>
    );
  }
  const screen = await render(<Controlled />);
  await userEvent.click(radio('b'));
  await expect.element(radio('b')).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'clear' }));
  expect(items().map((item) => item.getAttribute('aria-checked'))).toEqual([
    'false',
    'false',
    'false',
  ]);
});

test('form: one entry per pressed value, a required validator, and reset to the default', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <form aria-label="주문">
      {group({ name: 'size', required: true, onValueChange })}
      {group({ name: 'tags', selectionMode: 'multiple', defaultValue: ['x'] }, ['x', 'y', 'z'])}
      <button type="reset">초기화</button>
    </form>,
  );
  const form = screen.getByRole('form', { name: '주문' }).element() as HTMLFormElement;
  const validator = () => form.querySelector<HTMLInputElement>('[data-form-value-validator]')!;
  expect(validator().required).toBe(true);
  expect(validator().checkValidity()).toBe(false);
  await userEvent.click(radio('b'));
  await userEvent.click(button('z'));
  await userEvent.click(button('y'));
  const data = new FormData(form);
  expect(data.get('size')).toBe('b');
  expect(data.getAll('tags')).toEqual(['x', 'y', 'z']);
  expect(validator().checkValidity()).toBe(true);
  await userEvent.click(screen.getByRole('button', { name: '초기화' }));
  await expect.poll(() => new FormData(form).getAll('tags')).toEqual(['x']);
  await expect.poll(() => new FormData(form).get('size')).toBeNull();
  expect(onValueChange.mock.calls).toEqual([['b']]);
});

test('form names a form elsewhere in the document', async () => {
  const screen = await render(
    <div>
      <form id="order" aria-label="주문" />
      {group({ name: 'pick', form: 'order', defaultValue: 'c' })}
    </div>,
  );
  const form = screen.getByRole('form', { name: '주문' }).element() as HTMLFormElement;
  expect(new FormData(form).get('pick')).toBe('c');
  await expect.element(radio('a')).toHaveAttribute('form', 'order');
});

test('a disabled group disables its items and leaves the form', async () => {
  const screen = await render(
    <form aria-label="주문">{group({ name: 'pick', defaultValue: 'a', disabled: true })}</form>,
  );
  expect(items().map((item) => item.disabled)).toEqual([true, true, true]);
  const form = screen.getByRole('form', { name: '주문' }).element() as HTMLFormElement;
  expect(new FormData(form).get('pick')).toBeNull();
  await expect
    .element(screen.getByRole('radiogroup', { name: '그룹' }))
    .toHaveAttribute('aria-disabled', 'true');
});

test('a value of the wrong shape is read leniently', async () => {
  // @ts-expect-error A single group takes a string, not an array.
  const screen = await render(group({ defaultValue: ['b', 'c'] }));
  await expect.element(radio('b')).toHaveAttribute('aria-checked', 'true');
  await expect.element(radio('c')).toHaveAttribute('aria-checked', 'false');
  await screen.rerender(null);
  // @ts-expect-error A multiple group takes an array, not a string.
  await screen.rerender(group({ selectionMode: 'multiple', defaultValue: 'c' }));
  await expect.element(button('c')).toHaveAttribute('aria-pressed', 'true');
});
