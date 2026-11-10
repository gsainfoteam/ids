import { createRef, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Empty, IdsProvider, Link } from '../src';

type RouterState = { isActive: boolean };
type RouterLinkProps = Omit<ComponentProps<'a'>, 'children' | 'className' | 'style'> & {
  children: ReactNode | ((state: RouterState) => ReactNode);
  className?: string | ((state: RouterState) => string);
  style?: CSSProperties | ((state: RouterState) => CSSProperties);
};

function RouterLink({ children, className, style, ...props }: RouterLinkProps) {
  const state = { isActive: true };
  return (
    <a
      {...props}
      data-status="active"
      className={typeof className === 'function' ? className(state) : className}
      style={typeof style === 'function' ? style(state) : style}
    >
      {typeof children === 'function' ? children(state) : children}
    </a>
  );
}

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

test("asChild keeps a router link's render function children, with and without the hint", async () => {
  const screen = await render(
    <div>
      <Link asChild>
        <RouterLink href="/a">{({ isActive }) => (isActive ? 'Current' : 'Other')}</RouterLink>
      </Link>
      <Link asChild>
        <RouterLink href="/b" target="_blank">
          {({ isActive }) => (isActive ? 'External' : 'Other')}
        </RouterLink>
      </Link>
    </div>,
  );
  await expect.element(screen.getByRole('link', { name: 'Current' })).toHaveAttribute('data-link');
  await expect
    .element(screen.getByRole('link', { name: /External/ }))
    .toHaveAccessibleName('External (새 탭에서 열림)');
});

test("asChild keeps a router link's className and style functions and adds its own", async () => {
  const screen = await render(
    <Link asChild>
      <RouterLink
        href="/a"
        className={({ isActive }) => (isActive ? 'mine-active' : 'mine')}
        style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}
      >
        Current
      </RouterLink>
    </Link>,
  );
  const link = screen.getByRole('link');
  await expect.element(link).toHaveClass('mine-active');
  await expect.element(link).toHaveClass('focus-ring');
  expect(getComputedStyle(link.element()).fontWeight).toBe('700');
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

test('inside Empty.Description a Link keeps its own underline offset', async () => {
  const screen = await render(
    <div>
      <Link href="#a">Alone</Link>
      <Empty>
        <Empty.Description>
          <Link href="#b">Inside</Link>
        </Empty.Description>
      </Empty>
    </div>,
  );
  const alone = screen.getByRole('link', { name: 'Alone' }).element();
  const inside = screen.getByRole('link', { name: 'Inside' }).element();
  const offsetInEm = (element: Element) =>
    parseFloat(getComputedStyle(element).textUnderlineOffset) /
    parseFloat(getComputedStyle(element).fontSize);
  expect(offsetInEm(inside)).toBeCloseTo(offsetInEm(alone));
  expect(getComputedStyle(inside).color).toBe(getComputedStyle(alone).color);
});
