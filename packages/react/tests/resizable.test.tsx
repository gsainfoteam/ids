import { useState } from 'react';

import { renderToString } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Card, IdsProvider, Resizable } from '../src';
import { skipWithoutCdp } from './engines';

type Point = { x: number; y: number };

const frameOffset = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...frameOffset(point),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
  });
}

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', point?: Point) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: point ? [frameOffset(point)] : [],
  });
}

const centerOf = (element: Element): Point => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

const box = (screen: { container: HTMLElement }) =>
  screen.container.querySelector<HTMLElement>('[data-resizable]')!;

const sizeOf = (element: HTMLElement) => ({
  width: element.offsetWidth,
  height: element.offsetHeight,
});

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

afterEach(() => {
  vi.restoreAllMocks();
});

test('SSR: the default handle follows the direction and carries its ARIA from the first render', () => {
  const html = (direction: Resizable.Direction) =>
    parse(
      renderToString(
        <Resizable
          id="panel"
          direction={direction}
          defaultWidth={400}
          defaultHeight={300}
          minWidth={200}
        >
          내용
        </Resizable>,
      ),
    );

  const both = html('both');
  const root = both.querySelector<HTMLElement>('[data-resizable]')!;
  expect(root.style.width).toBe('400px');
  expect(root.style.height).toBe('300px');
  expect(root.getAttribute('data-direction')).toBe('both');
  const grip = both.querySelector('[role="group"]')!;
  expect(grip.getAttribute('aria-label')).toBe('크기 조절');
  expect(
    [...grip.querySelectorAll('[role="separator"]')].map((separator) => [
      separator.getAttribute('aria-label'),
      separator.getAttribute('aria-orientation'),
      separator.getAttribute('aria-valuenow'),
      separator.getAttribute('aria-valuemin'),
      separator.getAttribute('aria-valuetext'),
      separator.getAttribute('aria-controls'),
      separator.getAttribute('tabindex'),
    ]),
  ).toEqual([
    ['너비', 'vertical', '400', '200', '400px', 'panel', '0'],
    ['높이', 'horizontal', '300', '0', '300px', 'panel', '-1'],
  ]);

  const horizontal = html('horizontal').querySelector('[role="separator"]')!;
  expect(horizontal.getAttribute('aria-label')).toBe('너비');
  expect(horizontal.hasAttribute('aria-valuemax')).toBe(false);
  expect(html('horizontal').querySelectorAll('[role="separator"]')).toHaveLength(1);

  const vertical = html('vertical').querySelector('[role="separator"]')!;
  expect(vertical.getAttribute('aria-orientation')).toBe('horizontal');
  expect(vertical.getAttribute('aria-valuenow')).toBe('300');
});

test('an edge handle resizes by keys: 16px steps, 64px with Shift, Home and End to the bounds, Enter back', async () => {
  const onWidthChange = vi.fn();
  const screen = await render(
    <Resizable
      direction="horizontal"
      defaultWidth={200}
      minWidth={120}
      maxWidth={300}
      onWidthChange={onWidthChange}
      className="h-24"
    >
      내용
    </Resizable>,
  );
  const handle = screen.getByRole('separator', { name: '너비' });
  const width = () => box(screen).offsetWidth;

  await userEvent.keyboard('{Tab}');
  await expect.element(handle).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(width).toBe(216);
  await expect.element(handle).toHaveAttribute('aria-valuenow', '216');
  await expect.element(handle).toHaveAttribute('aria-valuetext', '216px');
  await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
  await expect.poll(width).toBe(152);
  await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
  await expect.poll(width, { message: 'clamped to minWidth' }).toBe(120);
  await userEvent.keyboard('{End}');
  await expect.poll(width).toBe(300);
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(width, { message: 'clamped to maxWidth' }).toBe(300);
  await userEvent.keyboard('{Home}');
  await expect.poll(width).toBe(120);
  await userEvent.keyboard('{Enter}');
  await expect.poll(width).toBe(200);
  expect(onWidthChange.mock.calls.map(([value]) => value)).toEqual([216, 152, 120, 300, 120, 200]);
});

test('the corner grip is one tab stop whose arrows resize each axis and move focus to the separator that changed', async () => {
  const screen = await render(
    <Resizable defaultWidth={240} defaultHeight={160} maxHeight={200}>
      내용
    </Resizable>,
  );
  const grip = screen.getByRole('group', { name: '크기 조절' });
  const width = screen.getByRole('separator', { name: '너비' });
  const height = screen.getByRole('separator', { name: '높이' });

  await userEvent.keyboard('{Tab}');
  await expect.element(width).toHaveFocus();
  expect(getComputedStyle(grip.element()).boxShadow).not.toBe('none');

  await userEvent.keyboard('{ArrowDown}');
  await expect.element(height).toHaveFocus();
  await expect.element(height).toHaveAttribute('aria-valuenow', '176');
  await expect.element(height).toHaveAttribute('tabindex', '0');
  await expect.element(width).toHaveAttribute('tabindex', '-1');

  await userEvent.keyboard('{End}');
  await expect.element(height).toHaveAttribute('aria-valuenow', '200');
  await expect.element(width).toHaveAttribute('aria-valuenow', '240');

  await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
  await expect.element(width).toHaveFocus();
  await expect.element(width).toHaveAttribute('aria-valuenow', '304');

  await userEvent.keyboard('{Home}');
  await expect.element(width).toHaveAttribute('aria-valuenow', '0');
  await userEvent.keyboard('{Enter}');
  await expect.poll(() => sizeOf(box(screen))).toEqual({ width: 240, height: 160 });

  await userEvent.keyboard('{Tab}');
  await expect.element(width).not.toHaveFocus();
  await expect.element(height).not.toHaveFocus();
});

test('controlled: the size moves only when the app writes it back', async () => {
  const onWidthChange = vi.fn();
  function Controlled({ accept }: { accept: boolean }) {
    const [width, setWidth] = useState(200);
    return (
      <Resizable
        direction="horizontal"
        width={width}
        onWidthChange={(next) => {
          onWidthChange(next);
          if (accept) setWidth(next);
        }}
        className="h-24"
      >
        {width}
      </Resizable>
    );
  }

  const screen = await render(<Controlled accept={false} />);
  const handle = screen.getByRole('separator', { name: '너비' });
  handle.element().focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(onWidthChange).toHaveBeenLastCalledWith(216);
  await expect.element(handle).toHaveAttribute('aria-valuenow', '200');
  expect(box(screen).offsetWidth).toBe(200);

  await screen.rerender(<Controlled key="accepts" accept />);
  screen.getByRole('separator', { name: '너비' }).element().focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(() => box(screen).offsetWidth).toBe(216);
  await expect.element(box(screen)).toHaveTextContent('216');
});

test('dragging an edge follows the pointer, writes the DOM each frame and reports once at the end', async (context) => {
  skipWithoutCdp(context);
  const onWidthChange = vi.fn();
  const screen = await render(
    <Resizable
      direction="horizontal"
      defaultWidth={200}
      maxWidth={260}
      onWidthChange={onWidthChange}
      className="h-24"
    >
      내용
    </Resizable>,
  );
  const handle = () => screen.getByRole('separator', { name: '너비' }).element();
  const start = centerOf(handle());

  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x + 20, y: start.y });
  await expect.poll(() => box(screen).offsetWidth).toBe(220);
  expect(onWidthChange).not.toHaveBeenCalled();
  await expect.element(handle()).toHaveAttribute('data-dragging');
  await expect.element(box(screen)).toHaveAttribute('data-dragging');
  expect(document.documentElement.style.cursor).toBe('ew-resize');
  expect(document.documentElement.style.userSelect).toBe('none');

  await mouse('mouseMoved', { x: start.x + 90, y: start.y });
  await expect.poll(() => box(screen).offsetWidth, { message: 'clamped to maxWidth' }).toBe(260);
  await mouse('mouseMoved', { x: start.x + 40, y: start.y });
  await mouse('mouseReleased', { x: start.x + 40, y: start.y });

  await expect.poll(() => box(screen).offsetWidth).toBe(240);
  expect(onWidthChange.mock.calls).toEqual([[240]]);
  await expect.element(handle()).toHaveAttribute('aria-valuenow', '240');
  await expect.element(handle()).not.toHaveAttribute('data-dragging');
  expect(document.documentElement.style.cursor).toBe('');
  expect(document.documentElement.style.userSelect).toBe('');
});

test('Escape during a drag restores the starting size; a double click resets', async (context) => {
  skipWithoutCdp(context);
  const onWidthChange = vi.fn();
  const screen = await render(
    <Resizable
      direction="horizontal"
      defaultWidth={200}
      onWidthChange={onWidthChange}
      className="h-24"
    >
      내용
    </Resizable>,
  );
  const handle = () => screen.getByRole('separator', { name: '너비' }).element();
  const start = centerOf(handle());

  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x + 50, y: start.y });
  await expect.poll(() => box(screen).offsetWidth).toBe(250);
  await userEvent.keyboard('{Escape}');
  await expect.poll(() => box(screen).offsetWidth).toBe(200);
  await mouse('mouseMoved', { x: start.x + 80, y: start.y });
  await mouse('mouseReleased', { x: start.x + 80, y: start.y });
  await nextFrame();
  expect(box(screen).offsetWidth).toBe(200);
  expect(onWidthChange).not.toHaveBeenCalled();

  handle().focus();
  await userEvent.keyboard('{ArrowRight}{ArrowRight}');
  await expect.poll(() => box(screen).offsetWidth).toBe(232);
  await userEvent.dblClick(handle());
  await expect.poll(() => box(screen).offsetWidth).toBe(200);
});

test('the grip drags both axes at once with the mouse, and by touch', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <Resizable defaultWidth={200} defaultHeight={120}>
      내용
    </Resizable>,
  );
  const grip = () => screen.getByRole('group', { name: '크기 조절' }).element();

  let start = centerOf(grip());
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x + 30, y: start.y + 20 });
  expect(document.documentElement.style.cursor).toBe('nwse-resize');
  await mouse('mouseReleased', { x: start.x + 30, y: start.y + 20 });
  await expect.poll(() => sizeOf(box(screen))).toEqual({ width: 230, height: 140 });

  start = centerOf(grip());
  await touch('touchStart', start);
  await touch('touchMove', { x: start.x - 20, y: start.y + 10 });
  await touch('touchMove', { x: start.x - 40, y: start.y + 30 });
  await touch('touchEnd');
  await expect.poll(() => sizeOf(box(screen))).toEqual({ width: 190, height: 170 });
});

test('right to left: the handle sits on the left, the arrow away from the box widens it, dragging left widens it', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <div dir="rtl" className="flex">
      <Resizable direction="horizontal" defaultWidth={200} className="h-24">
        내용
      </Resizable>
    </div>,
  );
  const handle = () => screen.getByRole('separator', { name: '너비' }).element();
  const root = box(screen).getBoundingClientRect();
  expect(Math.abs(centerOf(handle()).x - root.left)).toBeLessThanOrEqual(1);

  handle().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.poll(() => box(screen).offsetWidth).toBe(216);

  const start = centerOf(handle());
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x - 24, y: start.y });
  await mouse('mouseReleased', { x: start.x - 24, y: start.y });
  await expect.poll(() => box(screen).offsetWidth).toBe(240);
});

test('without a size the element keeps its natural size until resized, and Enter goes back to it', async () => {
  const onWidthChange = vi.fn();
  const screen = await render(
    <div className="w-72">
      <Resizable direction="horizontal" onWidthChange={onWidthChange} className="h-24 w-full">
        내용
      </Resizable>
    </div>,
  );
  const handle = screen.getByRole('separator', { name: '너비' });
  await expect.element(handle).toHaveAttribute('aria-valuenow', '288');
  expect(box(screen).style.width).toBe('');

  handle.element().focus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.poll(() => box(screen).style.width).toBe('272px');
  await userEvent.keyboard('{Enter}');
  await expect.poll(() => box(screen).style.width).toBe('');
  expect(box(screen).offsetWidth).toBe(288);
  expect(onWidthChange.mock.calls).toEqual([[272], [288]]);
});

test('CSS min and max in px bound the keys like the props do', async () => {
  const screen = await render(
    <Resizable direction="vertical" defaultHeight={100} className="max-h-32 min-h-20 w-40">
      내용
    </Resizable>,
  );
  const handle = screen.getByRole('separator', { name: '높이' });
  await expect.element(handle).toHaveAttribute('aria-valuemin', '80');
  await expect.element(handle).toHaveAttribute('aria-valuemax', '128');

  handle.element().focus();
  await userEvent.keyboard('{End}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '128');
  await userEvent.keyboard('{Home}');
  await expect.element(handle).toHaveAttribute('aria-valuenow', '80');
});

test('asChild resizes the child itself and puts the handle inside it; a declared Handle replaces the default', async () => {
  const screen = await render(
    <Resizable asChild direction="vertical" defaultHeight={120}>
      <section aria-label="패널" className="w-48">
        내용
        <Resizable.Handle asChild className="bg-red-500">
          <div data-testid="custom" />
        </Resizable.Handle>
      </section>
    </Resizable>,
  );
  const section = screen.getByRole('region', { name: '패널' }).element() as HTMLElement;
  expect(section.hasAttribute('data-resizable')).toBe(true);
  expect(section.style.height).toBe('120px');

  const handles = screen.getByRole('separator').elements();
  expect(handles).toHaveLength(1);
  const custom = screen.getByTestId('custom').element();
  expect(handles[0]).toBe(custom);
  expect(custom.parentElement).toBe(section);
  expect(custom.getAttribute('aria-controls')).toBe(section.id);
  expect(custom.className).toContain('bg-red-500');

  custom.focus();
  await userEvent.keyboard('{ArrowDown}');
  await expect.poll(() => section.offsetHeight).toBe(136);
});

test('disabled handles leave the tab order and ignore the pointer', async (context) => {
  skipWithoutCdp(context);
  const screen = await render(
    <>
      <button type="button">앞</button>
      <Resizable direction="horizontal" disabled defaultWidth={200} className="h-24">
        내용
      </Resizable>
      <button type="button">뒤</button>
    </>,
  );
  const handle = screen.getByRole('separator', { name: '너비' });
  await expect.element(handle).toHaveAttribute('aria-disabled', 'true');
  await expect.element(handle).not.toHaveAttribute('tabindex');

  screen.getByRole('button', { name: '앞' }).element().focus();
  await userEvent.keyboard('{Tab}');
  await expect.element(screen.getByRole('button', { name: '뒤' })).toHaveFocus();

  const start = centerOf(handle.element());
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x + 40, y: start.y });
  await mouse('mouseReleased', { x: start.x + 40, y: start.y });
  await nextFrame();
  expect(box(screen).offsetWidth).toBe(200);
});

test('dragging the grip inside a pressable card does not press the card', async (context) => {
  skipWithoutCdp(context);
  const onClick = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Card onClick={onClick}>
        <Card.Title>카드</Card.Title>
        <Resizable defaultWidth={160} defaultHeight={80}>
          내용
        </Resizable>
      </Card>
    </IdsProvider>,
  );
  const start = centerOf(screen.getByRole('group', { name: '크기 조절' }).element());
  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x + 10, y: start.y + 10 });
  await mouse('mouseReleased', { x: start.x + 10, y: start.y + 10 });
  await expect.poll(() => box(screen).offsetWidth).toBe(170);
  expect(onClick).not.toHaveBeenCalled();
});

test('dev warnings: a minimum above the maximum; a Handle outside Resizable throws', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  await render(
    <Resizable minWidth={300} maxWidth={200} minHeight={10} maxHeight={5}>
      내용
    </Resizable>,
  );
  await nextFrame();
  expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
    expect.stringMatching(/Resizable: the minimum width \(300px\) is greater than the maximum/),
    expect.stringMatching(/Resizable: the minimum height \(10px\) is greater than the maximum/),
  ]);

  expect(() => renderToString(<Resizable.Handle />)).toThrow(
    /\[IDS\] Resizable\.Handle must be rendered inside Resizable/,
  );
  expect(() =>
    renderToString(
      <Resizable asChild>
        <>하나</>
      </Resizable>,
    ),
  ).toThrow(/requires one element to resize/);
});
