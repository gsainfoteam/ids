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
