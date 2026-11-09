import { createRef, type ReactNode } from 'react';

import { GlobeAltIcon } from '@heroicons/react/16/solid';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import { IdsProvider, Marker } from '../src';

const parse = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html');
const markerIn = (root: ParentNode) => root.querySelector<HTMLElement>('[data-marker]')!;

const box = (element: Element) => element.getBoundingClientRect();

test('SSR: a muted paragraph that names its variant and size', () => {
  const marker = markerIn(
    parse(
      <Marker>
        <GlobeAltIcon />웹 검색 3건
      </Marker>,
    ),
  );
  expect(marker.tagName).toBe('P');
  expect(marker.hasAttribute('role')).toBe(false);
  expect(marker.dataset.variant).toBe('default');
  expect(marker.dataset.size).toBe('standard');
  expect(marker.hasAttribute('data-pending')).toBe(false);
  expect(marker.className).toContain('text-(--ids-color-on-muted)');
  expect(marker.className).toMatch(/\btext-body-b3-regular\b/);
  expect(marker.querySelector('.shimmer')).toBeNull();
  expect(marker.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
  expect(marker.querySelector('[data-spinner]')).toBeNull();
});

test('pending puts a quiet Spinner first and makes the paragraph the status', () => {
  const marker = markerIn(parse(<Marker pending>생각하는 중</Marker>));
  expect(marker.getAttribute('role')).toBe('status');
  expect(marker.hasAttribute('data-pending')).toBe(true);
  const content = marker.firstElementChild!;
  expect(content.className, 'only the text shimmers, not the empty row').toMatch(/\bshimmer\b/);
  expect(marker.className).not.toMatch(/\bshimmer\b/);
  const spinner = content.firstElementChild!;
  expect(spinner.hasAttribute('data-spinner')).toBe(true);
  expect(spinner.getAttribute('data-size')).toBe('standard');
  expect(
    marker.querySelectorAll('[role="status"]'),
    'the Spinner adds no status of its own',
  ).toHaveLength(0);
  expect(marker.textContent).toBe('생각하는 중');

  const tiny = markerIn(parse(<Marker pending size="tiny" role="log" />));
  expect(tiny.getAttribute('role'), 'a role passed in wins').toBe('log');
  expect(tiny.querySelector('[data-spinner]')!.getAttribute('data-size')).toBe('tiny');
});

test('separator draws two decorative Divider lines around the text, inside the paragraph', () => {
  const marker = markerIn(
    parse(
      <Marker variant="separator">
        <time dateTime="2026-10-27">10월 27일</time>
      </Marker>,
    ),
  );
  expect(marker.tagName).toBe('P');
  const [before, content, after] = Array.from(marker.children);
  for (const line of [before, after]) {
    expect(line.tagName, 'an hr cannot sit inside a paragraph').toBe('SPAN');
    expect(line.hasAttribute('data-divider')).toBe(true);
    expect(line.getAttribute('aria-hidden')).toBe('true');
    expect(line.hasAttribute('role')).toBe(false);
  }
  expect(content.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-27');
  expect(marker.querySelector('[role="separator"]')).toBeNull();
});

test('underline sets a neutral line under the row', () => {
  const marker = markerIn(parse(<Marker variant="underline">구현 메모를 열었어요</Marker>));
  expect(marker.className).toMatch(/\bborder-b\b/);
  expect(marker.className).toContain('border-(--ids-color-border)');
  expect(marker.className, 'a rounded corner would bend the line').not.toMatch(
    /\brounded-standard\b/,
  );
});

test('asChild hands the props to the child, keeps its children and its role', async () => {
  const ref = createRef<HTMLElement>();
  const screen = await render(
    <IdsProvider>
      <Marker asChild pending ref={ref} className="extra">
        <a href="#pr" className="own">
          풀 리퀘스트
        </a>
      </Marker>
    </IdsProvider>,
  );
  const link = screen.getByRole('link', { name: '풀 리퀘스트' });
  await expect.element(link).toHaveAttribute('data-marker');
  expect(link.element().hasAttribute('role'), 'a pending link is still a link').toBe(false);
  await expect.element(link).toHaveClass('own', 'extra');
  expect(link.element().firstElementChild!.classList.contains('shimmer')).toBe(true);
  expect(ref.current).toBe(link.element());
  expect(link.element().querySelector('[data-spinner]')).not.toBeNull();
  expect(getComputedStyle(link.element()).textDecorationLine).toBe('underline');
});

test('asChild without an element child fails loudly', () => {
  expect(() => renderToString(<Marker asChild>text</Marker>)).toThrow(/Marker asChild/);
});

test('icons take the icon token of the size, the separator lines share what the text leaves', async () => {
  const screen = await render(
    <IdsProvider>
      <div className="w-80">
        <Marker size="tiny" data-testid="tiny">
          <GlobeAltIcon data-testid="icon" />웹 검색
        </Marker>
        <Marker variant="separator" data-testid="separator">
          오늘
        </Marker>
      </div>
    </IdsProvider>,
  );
  const token = (name: string) =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  expect(box(screen.getByTestId('icon').element()).width).toBeCloseTo(
    token('--ids-size-icon-tiny'),
    0,
  );

  const separator = screen.getByTestId('separator').element();
  const [before, content, after] = Array.from(separator.children);
  expect(box(separator).width).toBeCloseTo(320, 0);
  expect(box(before).height).toBeCloseTo(1, 0);
  expect(box(before).width).toBeCloseTo(box(after).width, 0);
  expect(box(content).left).toBeGreaterThan(box(before).right);
  expect(
    Math.abs(box(content).left + box(content).width / 2 - (box(separator).left + 160)),
  ).toBeLessThan(1);
});
