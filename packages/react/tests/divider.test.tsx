import type { ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';

import { Divider } from '../src';

const parse = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const divider = (node: ReactNode) => parse(node).querySelector<HTMLElement>('[data-divider]')!;

test('a plain divider is a horizontal separator without focus or children', () => {
  const line = divider(<Divider />);
  expect(line.getAttribute('role')).toBe('separator');
  expect(line.getAttribute('aria-orientation')).toBe('horizontal');
  expect(line.hasAttribute('tabindex')).toBe(false);
  expect(line.children).toHaveLength(0);
  expect(line.className).toMatch(/bg-\(--ids-color-border\)/);
  expect(line.className).toMatch(/h-px w-full/);
});

test('vertical dividers stretch in a flex row and keep one line outside it', () => {
  const line = divider(<Divider orientation="vertical" />);
  expect(line.getAttribute('aria-orientation')).toBe('vertical');
  expect(line.dataset.orientation).toBe('vertical');
  expect(line.className).toMatch(/self-stretch/);
  expect(line.className).toMatch(/min-h-\[1lh\]/);
});

test('a label names the separator by reference', () => {
  const line = divider(<Divider>or</Divider>);
  const label = line.querySelector('span')!;
  expect(label.textContent).toBe('or');
  expect(line.getAttribute('aria-labelledby')).toBe(label.id);
  expect(line.hasAttribute('data-labelled')).toBe(true);
  expect(line.dataset.align).toBe('center');
  expect(line.className).not.toMatch(/before:hidden|after:hidden/);
});

test('align start and end hide the line on that side', () => {
  expect(divider(<Divider align="start">Recent</Divider>).className).toMatch(/before:hidden/);
  expect(divider(<Divider align="end">More</Divider>).className).toMatch(/after:hidden/);
  expect(divider(<Divider align="start" />).dataset.align, 'no label, no align').toBeUndefined();
});

test('aria-label and aria-labelledby win over the label', () => {
  const named = divider(<Divider aria-label="Section break">or</Divider>);
  expect(named.getAttribute('aria-label')).toBe('Section break');
  expect(named.hasAttribute('aria-labelledby')).toBe(false);
  expect(divider(<Divider aria-labelledby="x">or</Divider>).getAttribute('aria-labelledby')).toBe(
    'x',
  );
});

test('decorative dividers leave the accessibility tree', () => {
  const line = divider(<Divider decorative>or</Divider>);
  expect(line.hasAttribute('role')).toBe(false);
  expect(line.getAttribute('aria-hidden')).toBe('true');
  expect(line.hasAttribute('aria-labelledby')).toBe(false);
});

test('className and style may read the state', () => {
  const line = divider(
    <Divider
      orientation="vertical"
      className={(state) => `is-${state.orientation}-${state.labelled}`}
      style={(state) => ({ opacity: state.decorative ? 0.5 : 1 })}
    />,
  );
  expect(line.className).toMatch(/is-vertical-false/);
  expect(line.style.opacity).toBe('1');
});

test('asChild draws the line as the child element, without a label', () => {
  const line = parse(
    <ul>
      <Divider asChild decorative>
        <li />
      </Divider>
    </ul>,
  ).querySelector<HTMLElement>('ul > li')!;
  expect(line.hasAttribute('data-divider')).toBe(true);
  expect(line.getAttribute('aria-hidden')).toBe('true');
  expect(line.children).toHaveLength(0);
  expect(line.className).toMatch(/h-px w-full/);
  const rule = parse(
    <Divider asChild>
      <hr />
    </Divider>,
  ).body.firstElementChild!;
  expect(rule.tagName).toBe('HR');
  expect(rule.className, "the hr's own top border does not cover the line").toMatch(/\bborder-0\b/);
  expect(rule.getAttribute('role')).toBe('separator');
  expect(() => renderToString(<Divider asChild>or</Divider>)).toThrow(/asChild/);
});
