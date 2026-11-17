import type { ReactElement } from 'react';

import { HeartIcon as HeartSolidIcon } from '@heroicons/react/16/solid';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { renderToString } from 'react-dom/server';
import { expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Button, IconButton, IconToggle, IdsProvider, Toggle } from '../src';
import { testTheme } from './theme';

const NO_BACKGROUND = 'rgba(0, 0, 0, 0)';
const HOVER_OPACITY = '0.7';
const PRESS_OPACITY = '0.4';

async function renderInTheme(control: ReactElement) {
  const screen = await render(
    <IdsProvider theme={testTheme}>
      {control}
      <p>Elsewhere</p>
    </IdsProvider>,
  );
  const token = (name: string) => {
    const probe = document.createElement('div');
    probe.style.color = `var(${name})`;
    screen.container.querySelector('[data-mode]')!.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  };
  return { screen, token };
}

function paint(element: Element) {
  const style = getComputedStyle(element);
  return {
    background: style.backgroundColor,
    image: style.backgroundImage,
    shadow: style.boxShadow,
    color: style.color,
    opacity: style.opacity,
  };
}

test.each([
  [
    'Button',
    <Button key="button" variant="transparent" colorScheme="danger">
      삭제
    </Button>,
  ],
  [
    'IconButton',
    <IconButton
      key="icon-button"
      variant="transparent"
      colorScheme="danger"
      icon={<TrashIcon />}
      aria-label="삭제"
    />,
  ],
])(
  'a transparent %s never paints a background: hover and press lower the opacity, the text keeps its color',
  async (_, control) => {
    const { screen, token } = await renderInTheme(control);
    const button = screen.getByRole('button', { name: '삭제' });
    await expect.element(button).toHaveAttribute('data-variant', 'transparent');
    const element = button.element();

    expect(paint(element)).toEqual({
      background: NO_BACKGROUND,
      image: 'none',
      shadow: 'none',
      color: token('--ids-color-text-danger'),
      opacity: '1',
    });

    await userEvent.hover(button);
    await expect.element(button).toHaveAttribute('data-hovered');
    expect(paint(element)).toMatchObject({
      background: NO_BACKGROUND,
      shadow: 'none',
      color: token('--ids-color-text-danger'),
      opacity: HOVER_OPACITY,
    });

    (element as HTMLElement).focus();
    await userEvent.keyboard('[Space>]');
    await expect.element(button).toHaveAttribute('data-active');
    expect(paint(element)).toMatchObject({ background: NO_BACKGROUND, opacity: PRESS_OPACITY });
    await userEvent.keyboard('[/Space]');
    await expect.element(button).not.toHaveAttribute('data-active');
    await userEvent.hover(screen.getByText('Elsewhere'));
  },
);

test('a transparent Button in a brand scheme rests in the ghost foreground and still shows hover', async () => {
  const { screen, token } = await renderInTheme(<Button variant="transparent">취소</Button>);
  const button = screen.getByRole('button', { name: '취소' });
  await expect.element(button).toHaveAttribute('data-variant', 'transparent');
  expect(paint(button.element())).toMatchObject({
    color: token('--ids-color-on-surface'),
    opacity: '1',
  });

  await userEvent.hover(button);
  await expect.element(button).toHaveAttribute('data-hovered');
  expect(paint(button.element())).toMatchObject({
    background: NO_BACKGROUND,
    color: token('--ids-color-on-surface'),
    opacity: HOVER_OPACITY,
  });
  await userEvent.hover(screen.getByText('Elsewhere'));
});

test('a transparent IconToggle turns on by coloring only its glyph', async () => {
  const { screen, token } = await renderInTheme(
    <IconToggle
      aria-label="좋아요"
      variant="transparent"
      colorScheme="danger"
      icon={(state) =>
        state.pressed ? <HeartSolidIcon data-glyph="filled" /> : <HeartIcon data-glyph="outline" />
      }
    />,
  );
  const toggle = screen.getByRole('button', { name: '좋아요' });
  await expect.element(toggle).toHaveAttribute('data-variant', 'transparent');
  const element = toggle.element();

  expect(paint(element)).toMatchObject({
    background: NO_BACKGROUND,
    shadow: 'none',
    color: token('--ids-color-on-surface'),
  });

  await userEvent.hover(toggle);
  await expect.element(toggle).toHaveAttribute('data-hovered');
  expect(paint(element)).toMatchObject({ background: NO_BACKGROUND, opacity: HOVER_OPACITY });

  (element as HTMLElement).focus();
  await userEvent.keyboard('[Space>]');
  await expect.element(toggle).toHaveAttribute('data-active');
  expect(paint(element)).toMatchObject({ background: NO_BACKGROUND, opacity: PRESS_OPACITY });
  await userEvent.keyboard('[/Space]');

  await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect.element(toggle).toHaveAttribute('data-pressed');
  expect(element.querySelector('svg')!.dataset.glyph).toBe('filled');
  (element as HTMLElement).blur();
  await userEvent.hover(screen.getByText('Elsewhere'));
  expect(paint(element)).toEqual({
    background: NO_BACKGROUND,
    image: 'none',
    shadow: 'none',
    color: token('--ids-color-text-danger'),
    opacity: '1',
  });

  await userEvent.hover(toggle);
  await expect.element(toggle).not.toHaveAttribute('data-hovered');
  expect(paint(element).opacity).toBe('1');
  await userEvent.hover(screen.getByText('Elsewhere'));
});

test('SSR: a transparent IconToggle names its variant and keeps the 36px and 32px squares', () => {
  const html = renderToString(
    <>
      <IconToggle variant="transparent" icon={<HeartIcon />} aria-label="좋아요" />
      <IconToggle variant="transparent" size="tiny" icon={<HeartIcon />} aria-label="좋아요" />
    </>,
  );
  const [standard, tiny] = new DOMParser()
    .parseFromString(html, 'text/html')
    .querySelectorAll('button');
  expect(standard!.dataset.variant).toBe('transparent');
  expect(standard!.className).toMatch(/size-\(--ids-size-control-standard\)/);
  expect(tiny!.className).toMatch(/size-\(--ids-size-control-tiny\)/);
});

test('a text Toggle does not take the transparent variant', () => {
  // @ts-expect-error A text toggle would show its on state by color alone.
  expect(renderToString(<Toggle variant="transparent">굵게</Toggle>)).toContain('굵게');
});
