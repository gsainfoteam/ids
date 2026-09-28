import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Accordion } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const trigger = (value: string) => page.getByRole('button', { name: `Section ${value}` });
const panelOf = (value: string) =>
  document.getElementById(trigger(value).element().getAttribute('aria-controls')!)!;
const expanded = () =>
  Array.from(document.querySelectorAll('[data-accordion-trigger]')).map((element) =>
    element.getAttribute('aria-expanded'),
  );
const holdCollapseUntilFinished = (panel: HTMLElement) => {
  panel.style.transition = 'grid-template-rows 60s';
};
const finishCollapse = (panel: HTMLElement) => {
  for (const animation of panel.getAnimations()) animation.finish();
};

function items(values = ['a', 'b', 'c'], disabled: string[] = []) {
  return values.map((value) => (
    <Accordion.Item key={value} value={value} disabled={disabled.includes(value)}>
      <Accordion.Trigger>{`Section ${value}`}</Accordion.Trigger>
      <Accordion.Content>
        <button type="button" id={`inside-${value}`}>
          {`Inside ${value}`}
        </button>
      </Accordion.Content>
    </Accordion.Item>
  ));
}

test('SSR: each header is a heading with a button that controls a labelled region', () => {
  const doc = parse(
    renderToString(
      <Accordion type="single" defaultValue="a" headingLevel={2}>
        {items()}
      </Accordion>,
    ),
  );
  const buttons = Array.from(
    doc.querySelectorAll<HTMLElement>('h2 > button[data-accordion-trigger]'),
  );
  expect(buttons).toHaveLength(3);
  const [first, second] = buttons;
  expect(first!.getAttribute('aria-expanded')).toBe('true');
  expect(second!.getAttribute('aria-expanded')).toBe('false');
  const region = doc.getElementById(first!.getAttribute('aria-controls')!)!;
  expect(region.getAttribute('role')).toBe('region');
  expect(region.getAttribute('aria-labelledby')).toBe(first!.id);
  expect(region.hasAttribute('hidden')).toBe(false);
  expect(doc.getElementById(second!.getAttribute('aria-controls')!)!.hasAttribute('hidden')).toBe(
    true,
  );
  expect(
    first!.querySelector('[data-accordion-indicator] svg'),
    'a default chevron is drawn',
  ).not.toBeNull();
  expect(first!.dataset.state).toBe('open');
  expect(first!.hasAttribute('data-open')).toBe(true);
  expect(doc.querySelector<HTMLElement>('[data-accordion]')!.dataset.variant).toBe('outline');
});

test('single: one open at a time, a second press closes it when collapsible', async () => {
  const onValueChange = vi.fn();
  await render(
    <Accordion type="single" onValueChange={onValueChange}>
      {items()}
    </Accordion>,
  );
  await userEvent.click(trigger('a'));
  await userEvent.click(trigger('b'));
  expect(expanded()).toEqual(['false', 'true', 'false']);
  await userEvent.click(trigger('b'));
  expect(expanded()).toEqual(['false', 'false', 'false']);
  expect(onValueChange.mock.calls).toEqual([['a'], ['b'], [null]]);
});

test('single, not collapsible: the open header is aria-disabled and stays open', async () => {
  const onValueChange = vi.fn();
  await render(
    <Accordion type="single" collapsible={false} defaultValue="a" onValueChange={onValueChange}>
      {items()}
    </Accordion>,
  );
  await expect.element(trigger('a')).toHaveAttribute('aria-disabled', 'true');
  await expect.element(trigger('a')).not.toHaveAttribute('disabled');
  await userEvent.keyboard('{Tab}');
  await expect.element(trigger('a'), { message: 'it stays focusable' }).toHaveFocus();
  await userEvent.click(trigger('a'), { force: true });
  expect(expanded()).toEqual(['true', 'false', 'false']);
  expect(onValueChange).not.toHaveBeenCalled();
  await userEvent.click(trigger('b'));
  await expect.element(trigger('a')).not.toHaveAttribute('aria-disabled');
  await expect.element(trigger('b')).toHaveAttribute('aria-disabled', 'true');
});

test('multiple: controlled value opens several items and follows the parent', async () => {
  const changes: string[][] = [];
  function App() {
    const [value, setValue] = useState(['a']);
    return (
      <>
        <Accordion
          type="multiple"
          value={value}
          onValueChange={(next) => {
            changes.push(next);
            setValue(next);
          }}
        >
          {items()}
        </Accordion>
        <button type="button" onClick={() => setValue(['a', 'b', 'c'])}>
          Open all
        </button>
      </>
    );
  }
  const screen = await render(<App />);
  await userEvent.click(trigger('c'));
  expect(expanded()).toEqual(['true', 'false', 'true']);
  await userEvent.click(trigger('a'));
  expect(changes).toEqual([['a', 'c'], ['c']]);
  await userEvent.click(screen.getByRole('button', { name: 'Open all' }));
  expect(expanded()).toEqual(['true', 'true', 'true']);
});

test('keyboard: arrows wrap, Home/End jump, disabled headers and nested accordions are skipped', async () => {
  const screen = await render(
    <Accordion type="multiple" defaultValue={['a']}>
      <Accordion.Item value="a">
        <Accordion.Trigger>A</Accordion.Trigger>
        <Accordion.Content>
          <Accordion type="single">
            <Accordion.Item value="inner">
              <Accordion.Trigger>Inner</Accordion.Trigger>
            </Accordion.Item>
          </Accordion>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b" disabled>
        <Accordion.Trigger>B</Accordion.Trigger>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Trigger>C</Accordion.Trigger>
      </Accordion.Item>
    </Accordion>,
  );
  const header = (name: string) => screen.getByRole('button', { name, exact: true });
  await expect.element(header('B')).toHaveAttribute('disabled');
  await userEvent.keyboard('{Tab}');
  await expect.element(header('A')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(header('C')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.element(header('A'), { message: 'wraps to the first header' }).toHaveFocus();
  await userEvent.keyboard('{ArrowUp}');
  await expect.element(header('C')).toHaveFocus();
  await userEvent.keyboard('{Home}');
  await expect.element(header('A')).toHaveFocus();
  await userEvent.keyboard('{End}');
  await expect.element(header('C')).toHaveFocus();
  await userEvent.keyboard('{Meta>}{ArrowUp}{/Meta}');
  await expect
    .element(header('C'), { message: 'modified keys are left to the browser' })
    .toHaveFocus();
  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(header('Inner')).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}');
  await expect
    .element(header('Inner'), {
      message: 'the nested accordion only moves between its own headers',
    })
    .toHaveFocus();
});

test('a closed panel stays findable: hidden="until-found", and beforematch opens it', async () => {
  onTestFinished(() => history.replaceState(null, '', location.pathname + location.search));
  const onValueChange = vi.fn();
  const screen = await render(
    <>
      <a href="#inside-b">Jump to b</a>
      <Accordion type="single" defaultValue="a" onValueChange={onValueChange}>
        {items(['a', 'b', 'c'], ['c'])}
      </Accordion>
    </>,
  );
  expect(panelOf('b').getAttribute('hidden')).toBe('until-found');
  expect(panelOf('c').getAttribute('hidden'), 'a disabled item is not searchable').toBe('');
  await userEvent.click(screen.getByRole('link', { name: 'Jump to b' }));
  await expect.element(trigger('b')).toHaveAttribute('aria-expanded', 'true');
  expect(expanded()).toEqual(['false', 'true', 'false']);
  expect(panelOf('b').hasAttribute('hidden')).toBe(false);
  expect(onValueChange.mock.calls).toEqual([['b']]);
});

test('closing: the panel is inert while it collapses, then hidden until found', async () => {
  await render(
    <Accordion type="single" defaultValue="a">
      {items()}
    </Accordion>,
  );
  const panel = panelOf('a');
  holdCollapseUntilFinished(panel);
  await userEvent.click(trigger('a'));
  await expect.element(panel).toHaveAttribute('inert');
  await expect
    .element(panel, { message: 'still visible so the height can animate' })
    .not.toHaveAttribute('hidden');
  await expect.element(panel).toHaveAttribute('data-state', 'closed');
  finishCollapse(panel);
  await expect.element(panel).not.toHaveAttribute('inert');
  await expect.element(panel).toHaveAttribute('hidden', 'until-found');
});

test('focus inside a panel that closes goes back to its header', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Accordion type="single" value="a" onValueChange={onValueChange}>
      {items()}
    </Accordion>,
  );
  const inside = screen.getByRole('button', { name: 'Inside a' });
  await userEvent.click(inside);
  await expect.element(inside).toHaveFocus();
  await screen.rerender(
    <Accordion type="single" value={null} onValueChange={onValueChange}>
      {items()}
    </Accordion>,
  );
  await expect.element(trigger('a')).toHaveFocus();
});

test('disabled root disables every header; parts render state through functions', async () => {
  const seen: Accordion.Trigger.State[] = [];
  const screen = await render(
    <Accordion type="multiple" disabled defaultValue={['a']}>
      <Accordion.Item value="a" className={(state) => (state.open ? 'is-open' : 'is-closed')}>
        <Accordion.Trigger>
          {(state) => {
            seen.push(state);
            return `A ${state.disabled ? 'off' : 'on'}`;
          }}
        </Accordion.Trigger>
        <Accordion.Content>Body</Accordion.Content>
      </Accordion.Item>
    </Accordion>,
  );
  const a = screen.getByRole('button', { name: 'A off' });
  await expect.element(a).toHaveAttribute('disabled');
  expect(a.element().textContent).toBe('A off');
  await expect
    .element(screen.container.querySelector<HTMLElement>('[data-accordion-item]')!)
    .toHaveClass('is-open');
  expect(seen.at(-1)!.value).toBe('a');
  expect(seen.at(-1)!.open).toBe(true);
  await expect
    .element(screen.container.querySelector<HTMLElement>('[data-accordion]')!)
    .toHaveAttribute('data-disabled');
});

test('a custom Indicator replaces the default chevron wherever it is placed', async () => {
  const screen = await render(
    <Accordion type="single">
      <Accordion.Item value="a">
        <Accordion.Trigger>
          <Accordion.Indicator>{(state) => (state.open ? '-' : '+')}</Accordion.Indicator>
          Leading
        </Accordion.Trigger>
      </Accordion.Item>
    </Accordion>,
  );
  const a = screen.getByRole('button', { name: 'Leading' });
  expect(a.element().querySelectorAll('[data-accordion-indicator]')).toHaveLength(1);
  expect(a.element().firstElementChild!.textContent).toBe('+');
  expect(a.element().firstElementChild!.getAttribute('aria-hidden')).toBe('true');
  await userEvent.click(a);
  expect(a.element().firstElementChild!.textContent).toBe('-');
});

test('parts outside their parents throw', () => {
  expect(() => renderToString(<Accordion.Item value="a" />)).toThrow(/inside `<Accordion>`/);
  expect(() =>
    renderToString(
      <Accordion type="single">
        <Accordion.Trigger>x</Accordion.Trigger>
      </Accordion>,
    ),
  ).toThrow(/inside `<Accordion.Item>`/);
});
