import { BoldIcon, HeartIcon } from '@heroicons/react/24/outline';
import { renderToString } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IconToggle } from '../src';

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

test('SSR: named from the icon, pressed state exposed, ghost by default', () => {
  const toggle = parse(
    renderToString(<IconToggle icon={<BoldIcon />} defaultPressed />),
  ).querySelector('button')!;
  expect(toggle.getAttribute('aria-label')).toBe('Bold');
  expect(toggle.getAttribute('aria-pressed')).toBe('true');
  expect(toggle.hasAttribute('data-pressed')).toBe(true);
  expect(toggle.dataset.variant).toBe('ghost');
});

test('an explicit name wins and stays put while the icon follows the state', async () => {
  const onPressedChange = vi.fn();
  const screen = await render(
    <IconToggle
      aria-label="좋아요"
      icon={(state) => {
        const Icon = state.pressed ? HeartIcon : BoldIcon;
        return <Icon data-on={String(state.pressed)} />;
      }}
      onPressedChange={onPressedChange}
    />,
  );
  const toggle = screen.getByRole('button', { name: '좋아요' });
  await expect.element(toggle).toHaveAttribute('aria-label', '좋아요');
  expect(toggle.element().querySelector('svg')!.dataset.on).toBe('false');
  await userEvent.click(toggle);
  expect(onPressedChange.mock.calls).toEqual([[true]]);
  await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.element(toggle).toHaveAttribute('aria-label', '좋아요');
  expect(toggle.element().querySelector('svg')!.dataset.on).toBe('true');
});

test('children and a missing icon are rejected', () => {
  expect(() =>
    renderToString(
      // @ts-expect-error The icon goes through the icon prop, not children.
      <IconToggle icon={<BoldIcon />}>x</IconToggle>,
    ),
  ).toThrow(/icon` prop, not/);
  // @ts-expect-error The icon prop is required.
  expect(() => renderToString(<IconToggle />)).toThrow(/`icon` prop is required/);
});
