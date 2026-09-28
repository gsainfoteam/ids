import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { ButtonGroup, Toggle, ToggleGroup } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

test('SSR: a quiet ghost toggle that exposes its pressed state', () => {
  const [off, on] = parse(
    renderToString(
      <div>
        <Toggle>굵게</Toggle>
        <Toggle defaultPressed>기울임</Toggle>
      </div>,
    ),
  ).querySelectorAll('button');
  expect(off.type).toBe('button');
  expect(off.getAttribute('aria-pressed')).toBe('false');
  expect(off.hasAttribute('data-pressed')).toBe(false);
  expect(off.dataset.variant).toBe('ghost');
  expect(on.getAttribute('aria-pressed')).toBe('true');
  expect(on.hasAttribute('data-pressed')).toBe(true);
});

test('uncontrolled: a click flips the state and reports it', async () => {
  const onPressedChange = vi.fn();
  const screen = await render(<Toggle onPressedChange={onPressedChange}>굵게</Toggle>);
  const toggle = screen.getByRole('button', { name: '굵게' });
  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(onPressedChange.mock.calls).toEqual([[true], [false]]);
});

test('controlled: the state follows the prop', async () => {
  const onPressedChange = vi.fn();
  const screen = await render(
    <Toggle pressed={false} onPressedChange={onPressedChange}>
      굵게
    </Toggle>,
  );
  const toggle = screen.getByRole('button', { name: '굵게' });
  await userEvent.click(toggle);
  expect(onPressedChange.mock.calls).toEqual([[true]]);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');

  function Controlled() {
    const [pressed, setPressed] = useState(true);
    return (
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        굵게
      </Toggle>
    );
  }
  await screen.rerender(<Controlled />);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('onClick runs first and preventDefault keeps the state', async () => {
  const onPressedChange = vi.fn();
  const screen = await render(
    <Toggle onClick={(event) => event.preventDefault()} onPressedChange={onPressedChange}>
      굵게
    </Toggle>,
  );
  const toggle = screen.getByRole('button', { name: '굵게' });
  await userEvent.click(toggle);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(onPressedChange).not.toHaveBeenCalled();
});

test('a disabled toggle does not change', async () => {
  const onPressedChange = vi.fn();
  const screen = await render(
    <Toggle disabled onPressedChange={onPressedChange}>
      굵게
    </Toggle>,
  );
  const toggle = screen.getByRole('button', { name: '굵게' });
  await userEvent.click(toggle, { force: true });
  expect(onPressedChange).not.toHaveBeenCalled();
  await expect.element(toggle).toHaveAttribute('disabled');
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('size comes from the group unless the toggle sets it', async () => {
  const screen = await render(
    <ButtonGroup size="tiny">
      <Toggle>가</Toggle>
      <Toggle size="standard">나</Toggle>
    </ButtonGroup>,
  );
  await expect
    .element(screen.getByRole('button', { name: '가' }))
    .toHaveAttribute('data-size', 'tiny');
  await expect
    .element(screen.getByRole('button', { name: '나' }))
    .toHaveAttribute('data-size', 'standard');
});

test('inside ToggleGroup a value is required and the group owns the state', () => {
  expect(() =>
    renderToString(
      <ToggleGroup>
        <Toggle>가</Toggle>
      </ToggleGroup>,
    ),
  ).toThrow(/value/);
  expect(() =>
    renderToString(
      <ToggleGroup>
        <Toggle value="a" defaultPressed>
          가
        </Toggle>
      </ToggleGroup>,
    ),
  ).toThrow(/owns the pressed state/);
});
