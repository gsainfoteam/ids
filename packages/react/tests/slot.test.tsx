import { createRef, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Slot } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html').body
    .firstElementChild as HTMLElement;

test('renders only the child, with class names merged and Slot winning conflicts', () => {
  const element = html(
    <Slot className="px-2 text-red-500">
      <a href="/x" className="px-4 underline" />
    </Slot>,
  );
  expect(element.tagName).toBe('A');
  expect(element.getAttribute('href')).toBe('/x');
  expect(element.className.split(' ').sort()).toEqual(['px-2', 'text-red-500', 'underline']);
});

test('style is merged shallowly, other props go to the Slot unless it leaves them undefined', () => {
  const element = html(
    <Slot style={{ color: 'blue' }} aria-label="slot" title={undefined}>
      <span style={{ color: 'red', fontWeight: 600 }} aria-label="child" title="kept" />
    </Slot>,
  );
  expect(element.style.color).toBe('blue');
  expect(element.style.fontWeight).toBe('600');
  expect(element.getAttribute('aria-label')).toBe('slot');
  expect(element.getAttribute('title')).toBe('kept');
});

test('handlers run child first, and a prevented event skips the Slot handler', async () => {
  const calls: string[] = [];
  const screen = await render(
    <div>
      <Slot onClick={() => calls.push('slot')}>
        <button onClick={() => calls.push('child')}>both</button>
      </Slot>
      <Slot onClick={() => calls.push('skipped')}>
        <button onClick={(event) => event.preventDefault()}>stop</button>
      </Slot>
    </div>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'both' }));
  await userEvent.click(screen.getByRole('button', { name: 'stop' }));
  expect(calls).toEqual(['child', 'slot']);
});

test('both refs receive the element', async () => {
  const slotRef = createRef<HTMLElement>();
  const childRef = createRef<HTMLButtonElement>();
  const screen = await render(
    <Slot ref={slotRef}>
      <button ref={childRef} />
    </Slot>,
  );
  const button = screen.getByRole('button').element();
  expect(slotRef.current).toBe(button);
  expect(childRef.current).toBe(button);
});

test('one element child is required, and not a Fragment', () => {
  expect(() => renderToString(<Slot>text</Slot>)).toThrow(/exactly one React element/);
  expect(() =>
    renderToString(
      <Slot>
        <a />
        <b />
      </Slot>,
    ),
  ).toThrow(/exactly one React element/);
  expect(() =>
    renderToString(
      <Slot>
        <>
          <a />
        </>
      </Slot>,
    ),
  ).toThrow(/Fragment/);
});
