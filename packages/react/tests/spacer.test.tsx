import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import { Spacer } from '../src';

const parse = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const spacerIn = (node: ReactNode) => parse(node).querySelector<HTMLElement>('[data-spacer]')!;

test('a hidden span that grows by its flex share', () => {
  const spacer = spacerIn(<Spacer />);
  expect(spacer.tagName).toBe('SPAN');
  expect(spacer.getAttribute('aria-hidden')).toBe('true');
  expect(spacer.style.flexGrow).toBe('1');
  expect(spacer.textContent).toBe('');
  expect(spacer.className).toMatch(/basis-0/);
  expect(spacerIn(<Spacer flex={2} />).style.flexGrow).toBe('2');
});

test('it is valid inside a button', () => {
  const doc = parse(
    <button>
      Search
      <Spacer />
      <kbd>K</kbd>
    </button>,
  );
  expect(doc.querySelector('button > span[data-spacer]')).not.toBeNull();
});

test('flex must be a finite positive number', () => {
  for (const flex of [0, -1, Infinity, NaN])
    expect(() => renderToString(<Spacer flex={flex} />)).toThrow(/finite positive number/);
});

test('className and style may read the state, and style wins over flex', () => {
  const spacer = spacerIn(
    <Spacer
      flex={3}
      className={(state) => `share-${state.flex}`}
      style={() => ({ flexGrow: 5 })}
    />,
  );
  expect(spacer.className).toMatch(/share-3/);
  expect(spacer.style.flexGrow).toBe('5');
});

test('it warns outside a flex parent, but not while the parent is hidden', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(
    <div className="hidden">
      <Spacer />
    </div>,
  );
  expect(warn).not.toHaveBeenCalled();
  await render(
    <div className="block">
      <Spacer />
    </div>,
  );
  await expect.poll(() => warn).toHaveBeenCalledWith(expect.stringMatching(/not a flex container/));
  warn.mockRestore();
});

test('it checks a parent hidden at mount once the parent is shown', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const screen = await render(
    <div data-testid="parent" className="hidden">
      <Spacer />
    </div>,
  );
  await new Promise(requestAnimationFrame);
  expect(warn).not.toHaveBeenCalled();

  screen.getByTestId('parent').element().setAttribute('class', 'block');
  await expect.poll(() => warn).toHaveBeenCalledWith(expect.stringMatching(/not a flex container/));
  warn.mockRestore();
});
