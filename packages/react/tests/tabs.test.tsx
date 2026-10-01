import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Tabs } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const tab = (name: string) => page.getByRole('tab', { name, exact: true });
const panel = () => page.getByRole('tabpanel');
const tabIndexes = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'), (item) =>
    item.getAttribute('tabindex'),
  );

function tabs(
  props: Tabs.Props = {},
  values = ['a', 'b', 'c'],
  triggerProps: Record<string, Partial<Tabs.Trigger.Props>> = {},
  contentProps: Record<string, Partial<Tabs.Content.Props>> = {},
) {
  return (
    <Tabs {...props}>
      <Tabs.List aria-label="Sections">
        {values.map((value) => (
          <Tabs.Trigger key={value} value={value} {...triggerProps[value]}>
            {triggerProps[value]?.children ?? value}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {values.map((value) => (
        <Tabs.Content key={value} value={value} {...contentProps[value]}>
          {`Panel ${value}`}
        </Tabs.Content>
      ))}
    </Tabs>
  );
}

test('SSR: a named tablist of tabs, the selected one tabbable and wired to its panel', () => {
  const doc = parse(renderToString(tabs({ defaultValue: 'b' })));
  const list = doc.querySelector('[role="tablist"]')!;
  expect(list.getAttribute('aria-label')).toBe('Sections');
  expect(list.getAttribute('aria-orientation')).toBe('horizontal');
  const triggers = [...doc.querySelectorAll('[role="tab"]')];
  expect(triggers.map((item) => item.getAttribute('aria-selected'))).toEqual([
    'false',
    'true',
    'false',
  ]);
  expect(triggers.map((item) => item.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  const panels = [...doc.querySelectorAll('[role="tabpanel"]')];
  expect(panels).toHaveLength(1);
  expect(triggers[1]!.getAttribute('aria-controls')).toBe(panels[0]!.id);
  expect(panels[0]!.getAttribute('aria-labelledby')).toBe(triggers[1]!.id);
  expect(triggers[0]!.hasAttribute('aria-controls')).toBe(false);
  expect(panels[0]!.textContent).toBe('Panel b');
});

test('clicking a tab selects it, shows its panel and reports the value', async () => {
  const onValueChange = vi.fn();
  await render(tabs({ defaultValue: 'a', onValueChange }));
  await userEvent.click(tab('c'));
  await expect.element(tab('c')).toHaveAttribute('aria-selected', 'true');
  await expect.element(tab('a')).toHaveAttribute('aria-selected', 'false');
  await expect.element(panel()).toHaveTextContent('Panel c');
  await expect.element(panel()).toHaveAccessibleName('c');
  await userEvent.click(tab('c'));
  expect(onValueChange.mock.calls).toEqual([['c']]);
});

test('Tab lands on the selected tab, then moves on to the panel', async () => {
  await render(tabs({ defaultValue: 'b' }));
  await userEvent.keyboard('{Tab}');
  await expect.element(tab('b')).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(panel()).toHaveFocus();
});

test('automatic: arrows move focus and selection together, skip disabled tabs and loop', async () => {
  const onValueChange = vi.fn();
  await render(
    tabs({ defaultValue: 'a', onValueChange }, ['a', 'b', 'c', 'd'], { b: { disabled: true } }),
  );
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(tab('c')).toHaveFocus();
  await expect.element(tab('c')).toHaveAttribute('aria-selected', 'true');
  await expect.element(panel()).toHaveTextContent('Panel c');
  await userEvent.keyboard('{ArrowRight}{ArrowRight}');
  await expect.element(tab('a')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(tab('d')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(tab('a')).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(tab('d')).toHaveFocus();
  expect(onValueChange.mock.calls).toEqual([['c'], ['d'], ['a'], ['d'], ['a'], ['d']]);
  expect(tabIndexes()).toEqual(['-1', '-1', '-1', '0']);
});

test('arrows across the orientation and with a modifier are left to the browser', async () => {
  const consumed: boolean[] = [];
  await render(
    <div onKeyDown={(event) => consumed.push(event.defaultPrevented)}>
      {tabs({ defaultValue: 'a' })}
    </div>,
  );
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowDown}');
  await userEvent.keyboard('{Control>}{ArrowRight}{/Control}');
  await expect.element(tab('a')).toHaveFocus();
  expect(consumed).toEqual([false, false, false]);
});

test('manual: arrows move focus only; Enter and Space select', async () => {
  const onValueChange = vi.fn();
  await render(tabs({ defaultValue: 'a', activationMode: 'manual', onValueChange }));
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(tab('b')).toHaveFocus();
  await expect.element(tab('b')).toHaveAttribute('aria-selected', 'false');
  await expect.element(panel()).toHaveTextContent('Panel a');
  await userEvent.keyboard('{Enter}');
  await expect.element(tab('b')).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{ArrowRight} ');
  await expect.element(tab('c')).toHaveAttribute('aria-selected', 'true');
  expect(onValueChange.mock.calls).toEqual([['b'], ['c']]);
});

test('manual: leaving the list and coming back returns to the selected tab', async () => {
  await render(tabs({ defaultValue: 'a', activationMode: 'manual' }));
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowRight}{ArrowRight}');
  await expect.element(tab('c')).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(panel()).toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(tab('a')).toHaveFocus();
});

test('vertical: up and down move, left and right do not', async () => {
  await render(tabs({ defaultValue: 'a', orientation: 'vertical' }));
  await expect.element(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(tab('a')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(tab('b')).toHaveFocus();
  await userEvent.keyboard('{ArrowUp}{ArrowUp}');
  await expect.element(tab('c')).toHaveFocus();
});

test('right-to-left swaps the left and right arrows', async () => {
  await render(<div dir="rtl">{tabs({ defaultValue: 'a' })}</div>);
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(tab('b')).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(tab('a')).toHaveFocus();
});

test('loop={false} stops at the ends', async () => {
  await render(tabs({ defaultValue: 'c', loop: false }));
  tab('c').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(tab('c')).toHaveFocus();
});

test('without a value, the first enabled tab is shown without reporting a change', async () => {
  const onValueChange = vi.fn();
  await render(tabs({ onValueChange }, ['a', 'b'], { a: { disabled: true } }));
  await expect.element(tab('b')).toHaveAttribute('aria-selected', 'true');
  await expect.element(panel()).toHaveTextContent('Panel b');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('controlled: the value follows the prop', async () => {
  function Controlled() {
    const [value, setValue] = useState<'a' | 'b' | 'c'>('a');
    return (
      <div>
        {tabs({ value, onValueChange: (next) => setValue(next as 'a' | 'b' | 'c') })}
        <button type="button" onClick={() => setValue('c')}>
          jump
        </button>
      </div>
    );
  }
  const screen = await render(<Controlled />);
  await userEvent.click(tab('b'));
  await expect.element(tab('b')).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'jump' }));
  await expect.element(tab('c')).toHaveAttribute('aria-selected', 'true');
  await expect.element(panel()).toHaveTextContent('Panel c');
});

test('a controlled value that is never updated keeps the tab', async () => {
  const onValueChange = vi.fn();
  await render(tabs({ value: 'a', onValueChange }));
  await userEvent.click(tab('b'));
  expect(onValueChange).toHaveBeenCalledWith('b');
  await expect.element(tab('a')).toHaveAttribute('aria-selected', 'true');
});

test('forceMount keeps a hidden panel with its state, and aria-controls points at it', async () => {
  await render(
    <Tabs defaultValue="a">
      <Tabs.List aria-label="Sections">
        <Tabs.Trigger value="a">a</Tabs.Trigger>
        <Tabs.Trigger value="b">b</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a" forceMount>
        <input aria-label="Note" />
      </Tabs.Content>
      <Tabs.Content value="b">Panel b</Tabs.Content>
    </Tabs>,
  );
  await userEvent.fill(page.getByRole('textbox', { name: 'Note' }), 'kept');
  await expect.element(tab('b')).not.toHaveAttribute('aria-controls');
  await userEvent.click(tab('b'));
  const kept = document.getElementById(tab('a').element().getAttribute('aria-controls')!)!;
  expect(kept.getAttribute('hidden')).toBe('until-found');
  expect(kept.getAttribute('aria-labelledby')).toBe(tab('a').element().id);
  await userEvent.click(tab('a'));
  await expect.element(page.getByRole('textbox', { name: 'Note' })).toHaveValue('kept');
  await expect.element(tab('b')).not.toHaveAttribute('aria-controls');
});

test('finding text in a kept panel selects its tab', async () => {
  const onValueChange = vi.fn();
  await render(
    <Tabs defaultValue="a" onValueChange={onValueChange}>
      <Tabs.List aria-label="Sections">
        <Tabs.Trigger value="a">a</Tabs.Trigger>
        <Tabs.Trigger value="b">b</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">Panel a</Tabs.Content>
      <Tabs.Content value="b" forceMount>
        Panel b
      </Tabs.Content>
    </Tabs>,
  );
  const hiddenPanel = document.querySelector<HTMLElement>('[role="tabpanel"][hidden]')!;
  await expect.poll(() => hiddenPanel.getAttribute('hidden')).toBe('until-found');
  hiddenPanel.dispatchEvent(new Event('beforematch'));
  await expect.element(tab('b')).toHaveAttribute('aria-selected', 'true');
  expect(hiddenPanel.hasAttribute('hidden')).toBe(false);
  expect(onValueChange).toHaveBeenCalledWith('b');
});

test('render children hand over the parts', async () => {
  await render(
    <Tabs<'x' | 'y'> defaultValue="y">
      {({ List, Trigger, Content }) => (
        <>
          <List aria-label="Typed">
            <Trigger value="x">x</Trigger>
            <Trigger value="y">y</Trigger>
          </List>
          <Content value="x">Panel x</Content>
          <Content value="y">Panel y</Content>
        </>
      )}
    </Tabs>,
  );
  await expect.element(tab('y')).toHaveAttribute('aria-selected', 'true');
  await expect.element(panel()).toHaveTextContent('Panel y');
});

test('state props: selected, disabled and interaction reach className and children', async () => {
  await render(
    tabs({ defaultValue: 'a', appearance: 'pill', variant: 'solid' }, ['a', 'b'], {
      a: { className: ({ selected }) => (selected ? 'is-selected' : 'not-selected') },
      b: { children: ({ selected }) => (selected ? 'b (on)' : 'b (off)') },
    }),
  );
  await expect.element(tab('a')).toHaveClass('is-selected');
  await expect.element(tab('b (off)')).toBeInTheDocument();
  await expect.element(tab('a')).toHaveAttribute('data-selected', '');
  const root = document.querySelector('[data-appearance]')!;
  expect(root.getAttribute('data-appearance')).toBe('pill');
  expect(root.getAttribute('data-variant')).toBe('solid');
});

test('nested tabs keep their own roving focus', async () => {
  await render(
    <Tabs defaultValue="outer-a">
      <Tabs.List aria-label="Outer">
        <Tabs.Trigger value="outer-a">outer-a</Tabs.Trigger>
        <Tabs.Trigger value="outer-b">outer-b</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="outer-a">{tabs({ defaultValue: 'a' }, ['a', 'b'])}</Tabs.Content>
      <Tabs.Content value="outer-b">Outer b</Tabs.Content>
    </Tabs>,
  );
  tab('a').element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(tab('b')).toHaveFocus();
  await expect.element(tab('outer-a')).toHaveAttribute('aria-selected', 'true');
});

test('development warnings name a trigger without content, content without a trigger and an unknown value', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());
  await render(
    <Tabs defaultValue="z">
      <Tabs.List aria-label="Sections">
        <Tabs.Trigger value="a">a</Tabs.Trigger>
        <Tabs.Trigger value="b">b</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">Panel a</Tabs.Content>
      <Tabs.Content value="c">Panel c</Tabs.Content>
    </Tabs>,
  );
  await expect
    .poll(() => warn.mock.calls.map(([message]) => String(message)))
    .toEqual([
      '[IDS] Tabs.Trigger value="b" has no Tabs.Content with the same value.',
      '[IDS] Tabs.Content value="c" has no Tabs.Trigger with the same value.',
      '[IDS] Tabs: value="z" matches no Tabs.Trigger.',
    ]);
});
