import { createRef, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Link } from '../src';

const html = (node: ReactNode) =>
  new DOMParser().parseFromString(renderToString(node), 'text/html').querySelector('a')!;

test('SSR: a native link with accent color and an underline by default', () => {
  const element = html(<Link href="/notices">Notices</Link>);
  expect(element.getAttribute('href')).toBe('/notices');
  expect(element.hasAttribute('data-link')).toBe(true);
  expect(element.dataset.colorScheme).toBe('accent');
  expect(element.dataset.underline).toBe('always');
  expect(element.className).toMatch(/text-\(--ids-color-accent\)/);
  expect(element.className).toMatch(/focus-ring/);
  expect(element.hasAttribute('rel')).toBe(false);
  expect(element.querySelector('[data-link-new-tab]')).toBeNull();
});

test('a new tab link gets a safe rel, a hidden icon and a hint in its name', async () => {
  const screen = await render(
    <Link href="https://www.gist.ac.kr" target="_blank">
      GIST
    </Link>,
  );
  const link = screen.getByRole('link');
  await expect.element(link).toHaveAttribute('target', '_blank');
  await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect.element(link).toHaveAccessibleName('GIST (새 탭에서 열림)');
  expect(link.element().querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
});

test('the rel the app gives wins, and other targets get no hint', async () => {
  const screen = await render(
    <div>
      <Link href="/a" target="_blank" rel="noopener">
        Own rel
      </Link>
      <Link href="/b" target="_self">
        Same tab
      </Link>
    </div>,
  );
  await expect
    .element(screen.getByRole('link', { name: /Own rel/ }))
    .toHaveAttribute('rel', 'noopener');
  const same = screen.getByRole('link', { name: 'Same tab' });
  await expect.element(same).not.toHaveAttribute('rel');
  expect(same.element().querySelector('[data-link-new-tab]')).toBeNull();
});

test('the hint follows the IdsProvider translate', async () => {
  const screen = await render(
    <IdsProvider translate={(key) => (key === 'link.newTab' ? '(opens in a new tab)' : undefined)}>
      <Link href="https://www.gist.ac.kr" target="_blank">
        GIST
      </Link>
    </IdsProvider>,
  );
  await expect.element(screen.getByRole('link')).toHaveAccessibleName('GIST (opens in a new tab)');
});

test('asChild merges into the child, reads its target and appends the icon inside it', async () => {
  const ref = createRef<HTMLAnchorElement>();
  const screen = await render(
    <Link asChild colorScheme="neutral" underline="hover" ref={ref}>
      <a href="/x" target="_blank" className="font-semibold">
        Router
      </a>
    </Link>,
  );
  const link = screen.getByRole('link');
  await expect.element(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect.element(link).toHaveAttribute('data-color-scheme', 'neutral');
  await expect.element(link).toHaveClass('font-semibold');
  await expect.element(link).toHaveAccessibleName('Router (새 탭에서 열림)');
  expect(ref.current).toBe(link.element());
  expect(link.element().lastElementChild!.className).toBe('sr-only');
});

test('asChild without an element throws', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderToString(<Link asChild>text</Link>)).toThrow(/Link asChild/);
  vi.restoreAllMocks();
});

test('hover underline appears on hover and on keyboard focus', async () => {
  const screen = await render(
    <div>
      <button>before</button>
      <Link href="#terms" colorScheme="neutral" underline="hover">
        Terms
      </Link>
    </div>,
  );
  const link = screen.getByRole('link').element() as HTMLElement;
  expect(getComputedStyle(link).textDecorationLine).toBe('none');

  await userEvent.click(screen.getByRole('button'));
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('link')).toHaveFocus();
  expect(getComputedStyle(link).textDecorationLine).toBe('underline');
});

test('neutral follows the surrounding text color', async () => {
  const screen = await render(
    <p style={{ color: 'rgb(1, 2, 3)' }}>
      <Link href="#x" colorScheme="neutral">
        Inherit
      </Link>
    </p>,
  );
  const link = screen.getByRole('link').element() as HTMLElement;
  expect(getComputedStyle(link).color).toBe('rgb(1, 2, 3)');
});
