import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Button, Field, Spinner } from '../src';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});
afterEach(() => {
  vi.useRealTimers();
});
const settle = () => vi.advanceTimersByTime(150);

test('SSR: an aria-hidden svg sized to the text, and an empty status region', () => {
  const doc = new DOMParser().parseFromString(renderToString(<Spinner />), 'text/html');
  const icon = doc.querySelector('svg')!;
  expect(icon.getAttribute('aria-hidden')).toBe('true');
  expect(icon.getAttribute('width')).toBe('1em');
  expect(icon.getAttribute('height')).toBe('1em');
  expect(icon.hasAttribute('data-size')).toBe(false);
  expect(icon.getAttribute('class'), 'no size class, so controls can size it').not.toMatch(/size-/);
  expect(icon.getAttribute('class')).toMatch(/motion-reduce:animate-pulse/);
  expect(doc.querySelector('[role="status"]')!.textContent).toBe('');
});

test('the label is written after a delay so screen readers announce it', async () => {
  const screen = await render(<Spinner />);
  const status = screen.getByRole('status');
  expect(status.element().textContent).toBe('');
  settle();
  await expect.element(status).toHaveTextContent('불러오는 중');
  await screen.rerender(<Spinner aria-label="Loading comments" />);
  await expect.element(status).toHaveTextContent('Loading comments');
  expect(screen.container.querySelector('[data-spinner]')!.hasAttribute('aria-label')).toBe(false);
});

test('inside a button, a label or a live region the spinner goes quiet', async () => {
  const screen = await render(
    <Button disabled>
      <Spinner />
      Saving
    </Button>,
  );
  settle();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('button').element().textContent).toBe('Saving');

  await screen.rerender(
    <div key="live" role="alert">
      <Spinner />
    </div>,
  );
  settle();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();

  await screen.rerender(
    <label key="label">
      <Spinner />
      Name
    </label>,
  );
  settle();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
});

test('decorative forces either way', async () => {
  const screen = await render(<Spinner decorative />);
  settle();
  await expect.element(screen.getByRole('status')).not.toBeInTheDocument();
  await screen.rerender(
    <Button key="b">
      <Spinner decorative={false} />
      Saving
    </Button>,
  );
  settle();
  await expect.element(screen.getByRole('status')).toHaveTextContent('불러오는 중');
});

test('an explicit size, or the Field size, puts the icon token on the svg', async () => {
  const screen = await render(<Spinner size="tiny" />);
  const svg = () => screen.container.querySelector<SVGSVGElement>('[data-spinner]')!;
  expect(svg().dataset.size).toBe('tiny');
  expect(svg().getAttribute('class')).toMatch(/size-\(--ids-size-icon-tiny\)/);

  await screen.rerender(
    <Field key="field" size="tiny">
      <Field.Label>Name</Field.Label>
      <input />
      <Field.Hint>
        <Spinner />
      </Field.Hint>
    </Field>,
  );
  expect(svg().dataset.size).toBe('tiny');
});

test('className and other props go to the svg, className may read the state', async () => {
  const states: Spinner.State[] = [];
  const screen = await render(
    <Spinner
      id="spin"
      className={(state) => {
        states.push(state);
        return state.announced ? 'done size-8' : 'size-8';
      }}
    />,
  );
  const svg = screen.container.querySelector<SVGSVGElement>('[data-spinner]')!;
  expect(svg.id).toBe('spin');
  settle();
  await expect.element(svg).toHaveClass('size-8', 'done');
  expect(states.at(-1)).toStrictEqual({ size: undefined, announced: true });
});
