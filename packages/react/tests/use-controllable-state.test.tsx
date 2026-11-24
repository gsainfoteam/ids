import { useEffect } from 'react';

import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { useControllableState } from '../src';

function Twice({
  onValueChange,
  write,
}: {
  onValueChange: (value: number) => void;
  write: (set: (next: number | ((previous: number) => number)) => void) => void;
}) {
  const [value, setValue] = useControllableState({ defaultValue: 1, onValueChange });

  return (
    <button type="button" onClick={() => write(setValue)}>
      {value}
    </button>
  );
}

test('the same value set twice before a render is reported once', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Twice
      onValueChange={onValueChange}
      write={(set) => {
        set(4);
        set(4);
      }}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await expect.element(screen.getByRole('button')).toHaveTextContent('4');
  expect(onValueChange.mock.calls).toEqual([[4]]);
});

test('an updater sees the value set before it in the same batch', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Twice
      onValueChange={onValueChange}
      write={(set) => {
        set((previous) => previous + 1);
        set((previous) => previous + 1);
      }}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  await expect.element(screen.getByRole('button')).toHaveTextContent('3');
  expect(onValueChange.mock.calls).toEqual([[2], [3]]);
});

type Setter = ReturnType<typeof useControllableState<number>>[1];

function ReportsItsSetter({
  value,
  onValueChange,
  onRender,
}: {
  value?: number;
  onValueChange?: (value: number) => void;
  onRender: (setValue: Setter) => void;
}) {
  const [current, setValue] = useControllableState({ value, defaultValue: 0, onValueChange });

  useEffect(() => {
    onRender(setValue);
  });

  return <output>{current}</output>;
}

test('the setter is the same function on every render, controlled or not', async () => {
  const setters: Setter[] = [];
  const onRender = (setValue: Setter) => setters.push(setValue);
  const screen = await render(<ReportsItsSetter onRender={onRender} onValueChange={vi.fn()} />);

  await screen.rerender(<ReportsItsSetter onRender={onRender} onValueChange={vi.fn()} />);
  await screen.rerender(<ReportsItsSetter onRender={onRender} value={3} onValueChange={vi.fn()} />);
  await screen.rerender(<ReportsItsSetter onRender={onRender} value={4} onValueChange={vi.fn()} />);

  expect(setters.length).toBeGreaterThanOrEqual(4);
  for (const setter of setters) expect(setter).toBe(setters[0]);
});

test('a setter kept from an earlier render reads the latest value and callback', async () => {
  const setters: Setter[] = [];
  const onRender = (setValue: Setter) => setters.push(setValue);
  const first = vi.fn();
  const latest = vi.fn();
  const screen = await render(
    <ReportsItsSetter onRender={onRender} value={1} onValueChange={first} />,
  );
  const kept = setters[0]!;

  await screen.rerender(<ReportsItsSetter onRender={onRender} value={5} onValueChange={latest} />);
  kept((previous) => previous + 1);

  expect(latest.mock.calls).toEqual([[6]]);
  expect(first).not.toHaveBeenCalled();
});
