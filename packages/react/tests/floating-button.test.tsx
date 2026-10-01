import { createElement } from 'react';

import { PlusIcon } from '@heroicons/react/24/outline';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { FloatingButton } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const svgWithTitle = createElement('svg', { title: '추가' });

test('native defaults avoid form submit; nested visible text produces extended action', async () => {
  const onClick = vi.fn();
  const submitted = vi.fn();
  const screen = await render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <FloatingButton onClick={onClick}>
        <span>작성</span>
      </FloatingButton>
    </form>,
  );
  const button = screen.getByRole('button', { name: '작성' });
  await expect.element(button).toHaveAttribute('type', 'button');
  await expect.element(button).not.toHaveAttribute('data-icon-only');
  await userEvent.click(button);
  expect(onClick).toHaveBeenCalledOnce();
  expect(submitted).not.toHaveBeenCalled();
});

test('SSR icon-only name can come from explicit icon title; caller name wins', () => {
  for (const label of [undefined, '추가하기']) {
    const button = parse(
      renderToString(<FloatingButton aria-label={label}>{svgWithTitle}</FloatingButton>),
    ).querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe(label ?? '추가');
    expect(button.hasAttribute('data-icon-only')).toBe(true);
  }
});

test('asChild forwards both refs with cleanup and composes child/root handlers', async () => {
  const events: string[] = [];
  let childRef: HTMLElement | null = null;
  let rootRef: HTMLElement | null = null;
  let cleanups = 0;
  const screen = await render(
    <FloatingButton
      asChild
      ref={(node) => {
        rootRef = node;
        return () => {
          cleanups++;
        };
      }}
      onClick={() => events.push('root')}
    >
      <a
        href="#test"
        ref={(node) => {
          childRef = node;
          return () => {
            cleanups++;
          };
        }}
        onClick={() => events.push('child')}
      >
        새 글
      </a>
    </FloatingButton>,
  );
  const link = screen.getByRole('link', { name: '새 글' });
  await expect.element(link).toHaveAttribute('data-floating-button');
  expect(rootRef).toBe(link.element());
  expect(childRef).toBe(link.element());
  expect(link.element().tagName).toBe('A');
  await userEvent.click(link);
  expect(events).toEqual(['child', 'root']);
  await screen.rerender(null);
  expect(cleanups).toBe(2);
});

test('child cancellation prevents root action', async () => {
  const calls: string[] = [];
  const screen = await render(
    <FloatingButton asChild onClick={() => calls.push('root')}>
      <button
        onClick={(event) => {
          calls.push('child');
          event.preventDefault();
        }}
      >
        취소
      </button>
    </FloatingButton>,
  );
  await userEvent.click(screen.getByRole('button', { name: '취소' }));
  expect(calls).toEqual(['child']);
});

test('disabled links remove href and block child/root keyboard and click actions', async () => {
  const calls: string[] = [];
  const recordInsteadOfThrow = (name: string) => () => {
    calls.push(name);
  };
  const screen = await render(
    <FloatingButton
      asChild
      disabled
      onClick={recordInsteadOfThrow('root')}
      onKeyDown={recordInsteadOfThrow('root')}
    >
      <a
        href="#danger"
        onClick={recordInsteadOfThrow('child')}
        onKeyDown={recordInsteadOfThrow('child')}
      >
        비활성
      </a>
    </FloatingButton>,
  );
  const link = screen.getByRole('link', { name: '비활성' });
  await expect.element(link).not.toHaveAttribute('href');
  await expect.element(link).toHaveAttribute('role', 'link');
  await expect.element(link).toHaveAttribute('tabindex', '-1');
  await expect.element(link).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(link, { force: true });
  link.element().focus();
  await expect.element(link).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(calls).toEqual([]);
});

test('an icon-only button is named from the icon component; text makes it extended', () => {
  const doc = parse(
    renderToString(
      <div>
        <FloatingButton id="icon">
          <PlusIcon />
        </FloatingButton>
        <FloatingButton id="extended">
          <PlusIcon />
          작성
        </FloatingButton>
        <FloatingButton id="forced" iconOnly>
          <span>+</span>
        </FloatingButton>
      </div>,
    ),
  );
  const icon = doc.getElementById('icon')!;
  expect(icon.getAttribute('aria-label')).toBe('Plus');
  expect(icon.hasAttribute('data-icon-only')).toBe(true);
  const extended = doc.getElementById('extended')!;
  expect(extended.hasAttribute('aria-label')).toBe(false);
  expect(extended.hasAttribute('data-icon-only')).toBe(false);
  expect(doc.getElementById('forced')!.hasAttribute('data-icon-only')).toBe(true);
});

test('variant, colorScheme, size and placement land on the element', () => {
  const node = parse(
    renderToString(
      <FloatingButton
        variant="soft"
        colorScheme="danger"
        size="tiny"
        placement="top-left"
        aria-label="신고"
      >
        <svg />
      </FloatingButton>,
    ),
  ).querySelector<HTMLElement>('[data-floating-button]')!;
  expect(node.dataset.variant).toBe('soft');
  expect(node.dataset.size).toBe('tiny');
  expect(node.dataset.placement).toBe('top-left');
  expect(node.className).toMatch(/\[--control-fill:var\(--ids-color-danger\)\]/);
  expect(node.className).toMatch(/print:hidden/);
  expect(node.className).toMatch(/motion-safe:data-active:scale-95/);
  expect(node.className).toMatch(/motion-reduce:transition-none/);
});

test('render props update interaction state and keyboard focus remains visible', async () => {
  const screen = await render(
    <FloatingButton>{(state) => (state.focusVisible ? '키보드 포커스' : '실행')}</FloatingButton>,
  );
  const button = screen.getByRole('button');
  await userEvent.keyboard('{Tab}');
  await expect.element(button).toHaveFocus();
  await expect.element(button).toHaveTextContent('키보드 포커스');
  await expect.element(button).toHaveAttribute('data-focus-visible');
});

test('SSR: glossy keeps the floating shadow and layers the highlight over its fill', () => {
  const node = parse(
    renderToString(
      <FloatingButton variant="glossy" aria-label="작성">
        <svg />
      </FloatingButton>,
    ),
  ).querySelector<HTMLElement>('[data-floating-button]')!;
  expect(node.dataset.variant).toBe('glossy');
  expect(node.className).toMatch(/(^| )shadow-lg( |$)/);
  expect(node.className).toMatch(/(^| )bg-linear-to-b( |$)/);
  expect(node.className).toMatch(/(^| )bg-\(--control-fill\)( |$)/);
});
