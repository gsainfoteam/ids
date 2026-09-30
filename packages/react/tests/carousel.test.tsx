import { useState, type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Carousel } from '../src';
import { skipWithoutCdp } from './engines';
import { slidesLayout, useSlides, type SlidesDragEvent } from '../src/internal/slides';

type Point = { x: number; y: number };

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const region = (name = '사진') => page.getByRole('region', { name });
const slide = (n: number, count = 5) => page.getByRole('group', { name: `${count}장 중 ${n}번째` });
const previous = () => page.getByRole('button', { name: '이전 슬라이드' });
const next = () => page.getByRole('button', { name: '다음 슬라이드' });
const indicator = (n: number) => page.getByRole('button', { name: `${n}번째 슬라이드로` });
const pause = () => page.getByRole('button', { name: '자동 넘김 멈춤' });
const outside = () => page.getByRole('button', { name: '밖' });

const slideNodes = () => [...document.querySelectorAll<HTMLElement>('[data-carousel-slide]')];
const inertSlides = () => slideNodes().flatMap((node, index) => (node.inert ? [index + 1] : []));
const indicatorLabels = () =>
  [...document.querySelectorAll('[data-carousel-indicator]')].map((node) =>
    node.getAttribute('aria-label'),
  );
const announcer = () => document.querySelector('[data-slides-announcer]')!;
const trackOffset = () =>
  new DOMMatrix(getComputedStyle(document.querySelector('[data-slides-track]')!).transform).m41;

const frameOffset = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

const centerOf = (element: Element): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
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

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', points: Point[]) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: points.map((point, id) => ({ ...frameOffset(point), id })),
  });
}

const restsOn = (n: number) =>
  expect
    .poll(() => {
      const view = document.querySelector('[data-carousel-content]')!.getBoundingClientRect();
      return Math.abs(slideNodes()[n - 1].getBoundingClientRect().left - view.left);
    })
    .toBeLessThan(1);

async function dragAcross(element: Element, by: number) {
  const start = centerOf(element);
  await mouse('mousePressed', start);
  for (const step of [0.25, 0.5, 0.75, 1])
    await mouse('mouseMoved', { x: start.x + by * step, y: start.y });
  await mouse('mouseReleased', { x: start.x + by, y: start.y });
}

function Photos({
  count = 5,
  before,
  ...props
}: Partial<Carousel.Props> & { count?: number; before?: ReactNode }) {
  return (
    <>
      {before}
      <Carousel aria-label="사진" {...props}>
        {Array.from({ length: count }, (_, index) => (
          <Carousel.Slide key={index}>
            <div className="flex h-32 items-center justify-center">사진 {index + 1}</div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </>
  );
}

const outsideButton = <button type="button">밖</button>;

test('SSR: a named carousel region, a group per slide, and only the first slide in view', () => {
  const doc = parse(renderToString(<Photos />));
  const root = doc.querySelector('[data-carousel]')!;
  expect(root.getAttribute('role')).toBe('region');
  expect(root.getAttribute('aria-roledescription')).toBe('캐러셀');
  expect(root.getAttribute('aria-label')).toBe('사진');

  const groups = [...doc.querySelectorAll('[role="group"]')];
  expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
    '5장 중 1번째',
    '5장 중 2번째',
    '5장 중 3번째',
    '5장 중 4번째',
    '5장 중 5번째',
  ]);
  expect(new Set(groups.map((group) => group.getAttribute('aria-roledescription')))).toEqual(
    new Set(['슬라이드']),
  );
  expect(groups.map((group) => group.hasAttribute('inert'))).toEqual([
    false,
    true,
    true,
    true,
    true,
  ]);

  expect(doc.querySelector('[data-carousel-step="prev"]')!.getAttribute('aria-disabled')).toBe(
    'true',
  );
  expect(doc.querySelector('[data-carousel-step="next"]')!.hasAttribute('aria-disabled')).toBe(
    false,
  );
  expect(
    [...doc.querySelectorAll('[data-carousel-indicator]')].map((node) =>
      node.getAttribute('aria-current'),
    ),
  ).toEqual(['true', null, null, null, null]);

  const live = doc.querySelector('[data-slides-announcer]')!;
  expect(live.getAttribute('aria-live')).toBe('polite');
  expect(live.textContent).toBe('5장 중 1번째');
  expect(doc.querySelector('[data-carousel-pause]')).toBeNull();
});

test('SSR: CSS alone lays the server HTML out, already moved to defaultValue', () => {
  const host = document.createElement('div');
  host.style.width = '300px';
  document.body.append(host);
  onTestFinished(() => host.remove());

  const place = (node: ReactNode) => {
    host.innerHTML = renderToString(node);
    const view = host.querySelector('[data-carousel-content]')!.getBoundingClientRect();
    return { view, slides: slideNodes().map((node) => node.getBoundingClientRect()) };
  };

  const single = place(<Photos defaultValue={2} />);
  expect(single.slides[2].left).toBeCloseTo(single.view.left, 0);
  expect(single.slides[2].width).toBeCloseTo(single.view.width, 0);
  expect(host.querySelector('[data-slides-track]')!.getAttribute('style')).toContain(
    '--slides-offset:2',
  );

  const three = place(<Photos slidesPerView={3} defaultValue={1} />);
  expect(three.slides[1].left).toBeCloseTo(three.view.left, 0);
  expect(three.slides[3].right).toBeCloseTo(three.view.right, 0);
  expect(three.slides[0].width).toBeCloseTo(three.view.width / 3, 0);

  host.dir = 'rtl';
  const rtl = place(<Photos defaultValue={1} />);
  expect(rtl.slides[1].right).toBeCloseTo(rtl.view.right, 0);
});

test('buttons: Previous and Next stay focusable with aria-disabled at the ends', async () => {
  const onValueChange = vi.fn();
  await render(<Photos count={3} onValueChange={onValueChange} />);

  await expect.element(previous()).toHaveAttribute('aria-disabled', 'true');
  await userEvent.click(previous(), { force: true });
  await expect.element(previous()).toHaveFocus();
  expect(onValueChange).not.toHaveBeenCalled();

  await userEvent.click(next());
  await userEvent.click(next());
  expect(onValueChange).toHaveBeenLastCalledWith(2);
  await expect.element(slide(3, 3)).toHaveAttribute('data-selected');
  await expect.element(next()).toHaveAttribute('aria-disabled', 'true');
  await expect.element(next()).toHaveFocus();
  await expect.element(previous()).not.toHaveAttribute('aria-disabled');

  await userEvent.click(next(), { force: true });
  expect(onValueChange).toHaveBeenCalledTimes(2);
});

test('indicators: one per snap, named by the first slide it shows, and a press jumps there', async () => {
  const onValueChange = vi.fn();
  await render(
    <Photos count={6} slidesPerView={2} slidesToScroll={2} onValueChange={onValueChange} />,
  );

  await expect
    .poll(indicatorLabels)
    .toEqual(['1번째 슬라이드로', '3번째 슬라이드로', '5번째 슬라이드로']);
  await expect.element(indicator(1)).toHaveAttribute('aria-current', 'true');

  await userEvent.click(indicator(5));
  expect(onValueChange).toHaveBeenLastCalledWith(2);
  await expect.element(indicator(5)).toHaveAttribute('aria-current', 'true');
  await expect.element(indicator(1)).not.toHaveAttribute('aria-current');
  await expect.poll(inertSlides).toEqual([1, 2, 3, 4]);

  const dot = indicator(5).element().querySelector('span')!;
  const box = indicator(5).element().getBoundingClientRect();
  expect(dot.getBoundingClientRect().height).toBe(8);
  expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
});

test('keyboard: arrows step, Home and End jump, and focus follows the current indicator', async () => {
  const onValueChange = vi.fn();
  await render(<Photos onValueChange={onValueChange} />);

  await userEvent.click(indicator(1));
  await userEvent.keyboard('{ArrowRight}');
  expect(onValueChange).toHaveBeenLastCalledWith(1);
  await expect.element(indicator(2)).toHaveFocus();
  await expect.element(indicator(2)).toHaveAttribute('aria-current', 'true');

  await userEvent.keyboard('{End}');
  await expect.element(indicator(5)).toHaveFocus();
  onValueChange.mockClear();
  await userEvent.keyboard('{ArrowRight}');
  expect(onValueChange).not.toHaveBeenCalled();

  await userEvent.keyboard('{Home}');
  expect(onValueChange).toHaveBeenLastCalledWith(0);
  await expect.element(indicator(1)).toHaveFocus();
  onValueChange.mockClear();
  await userEvent.keyboard('{ArrowLeft}{Shift>}{ArrowRight}{/Shift}');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('keyboard: on Previous or Next the arrows keep focus on that button', async () => {
  await render(<Photos />);

  await userEvent.click(next());
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(slide(3)).toHaveAttribute('data-selected');
  await expect.element(next()).toHaveFocus();
  await userEvent.keyboard('{ArrowLeft}');
  await expect.element(slide(2)).toHaveAttribute('data-selected');
  await expect.element(next()).toHaveFocus();
});

test('keyboard: from inside a slide focus moves to the new slide before the old one goes inert', async () => {
  await render(
    <Carousel aria-label="사진">
      {[1, 2, 3].map((n) => (
        <Carousel.Slide key={n}>
          <a href={`#photo-${n}`}>사진 {n}</a>
        </Carousel.Slide>
      ))}
    </Carousel>,
  );

  await userEvent.keyboard('{Tab}{Tab}{Tab}');
  await expect.element(page.getByRole('link', { name: '사진 1' })).toHaveFocus();
  await userEvent.keyboard('{ArrowRight}');
  await expect.element(slide(2, 3)).toHaveFocus();
  await expect.poll(inertSlides).toEqual([1, 3]);
  expect(
    document.querySelector('[data-carousel-content]')!.matches(':has([data-slide]:focus-visible)'),
  ).toBe(true);
});

test('keyboard: a field in a slide keeps its arrows', async () => {
  const onValueChange = vi.fn();
  await render(
    <Carousel aria-label="사진" onValueChange={onValueChange}>
      <Carousel.Slide>
        <input aria-label="설명" defaultValue="첫 장" data-1p-ignore data-lpignore="true" />
      </Carousel.Slide>
      <Carousel.Slide>둘째 장</Carousel.Slide>
    </Carousel>,
  );

  await userEvent.click(page.getByRole('textbox', { name: '설명' }));
  await userEvent.keyboard('{ArrowRight}{ArrowLeft}{End}');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('keyboard: a vertical carousel moves with ↑ ↓ and leaves ← → to the page', async () => {
  const onValueChange = vi.fn();
  await render(
    <Carousel aria-label="사진" orientation="vertical" onValueChange={onValueChange}>
      <Carousel.Content className="h-40">
        {[1, 2, 3].map((n) => (
          <Carousel.Slide key={n}>사진 {n}</Carousel.Slide>
        ))}
      </Carousel.Content>
    </Carousel>,
  );

  await expect.element(previous()).toHaveAttribute('aria-disabled', 'true');
  expect(next().element().querySelector('path')!.getAttribute('d')).toMatch(/^M4\.22 6\.22/);
  await userEvent.click(indicator(1));
  await userEvent.keyboard('{ArrowRight}');
  expect(onValueChange).not.toHaveBeenCalled();
  await userEvent.keyboard('{ArrowDown}');
  expect(onValueChange).toHaveBeenLastCalledWith(1);
  await userEvent.keyboard('{ArrowUp}');
  expect(onValueChange).toHaveBeenLastCalledWith(0);

  const [first, second] = slideNodes().map((node) => node.getBoundingClientRect());
  expect(second.top).toBeCloseTo(first.bottom, 0);
});

test('keyboard: right to left swaps ← and →, and the arrows point the other way', async () => {
  const onValueChange = vi.fn();
  await render(
    <div dir="rtl">
      <Photos onValueChange={onValueChange} />
    </div>,
  );

  await userEvent.click(indicator(1));
  await userEvent.keyboard('{ArrowLeft}');
  expect(onValueChange).toHaveBeenLastCalledWith(1);
  await userEvent.keyboard('{ArrowRight}');
  expect(onValueChange).toHaveBeenLastCalledWith(0);

  const icon = next().element().querySelector('svg')!;
  expect(getComputedStyle(icon).scale).toBe('-1 1');
  await expect.poll(() => centerOf(slideNodes()[1]).x < centerOf(slideNodes()[0]).x).toBe(true);
});

test('value: uncontrolled starts at defaultValue and reports each move once', async () => {
  const onValueChange = vi.fn();
  await render(<Photos defaultValue={3} onValueChange={onValueChange} />);

  await expect.element(slide(4)).toHaveAttribute('data-selected');
  await expect.poll(inertSlides).toEqual([1, 2, 3, 5]);
  await userEvent.click(previous());
  expect(onValueChange.mock.calls).toEqual([[2]]);
  await expect.element(slide(3)).toHaveAttribute('data-selected');
});

test('value: controlled stays until the owner changes it', async () => {
  const onValueChange = vi.fn();
  const screen = await render(<Photos value={1} onValueChange={onValueChange} />);

  await userEvent.click(next());
  expect(onValueChange).toHaveBeenLastCalledWith(2);
  await expect.element(slide(2)).toHaveAttribute('data-selected');
  await expect.poll(inertSlides).toEqual([1, 3, 4, 5]);

  await screen.rerender(<Photos value={3} onValueChange={onValueChange} />);
  await expect.element(slide(4)).toHaveAttribute('data-selected');
  await expect.poll(inertSlides).toEqual([1, 2, 3, 5]);
});

test('value: a controlled owner can drive the carousel from outside', async () => {
  function Owner() {
    const [value, setValue] = useState(0);
    return (
      <>
        <button type="button" onClick={() => setValue(4)}>
          끝으로
        </button>
        <Photos value={value} onValueChange={setValue} />
      </>
    );
  }
  await render(<Owner />);

  await userEvent.click(page.getByRole('button', { name: '끝으로' }));
  await expect.element(slide(5)).toHaveAttribute('data-selected');
  await expect.poll(inertSlides).toEqual([1, 2, 3, 4]);
  await expect.element(next()).toHaveAttribute('aria-disabled', 'true');
});

test('loop: the ends connect, so Previous and Next never disable', async () => {
  const onValueChange = vi.fn();
  await render(<Photos loop onValueChange={onValueChange} />);

  await expect.element(previous()).not.toHaveAttribute('aria-disabled');
  await userEvent.click(previous());
  expect(onValueChange).toHaveBeenLastCalledWith(4);
  await expect.element(slide(5)).toHaveAttribute('data-selected');
  await userEvent.click(next());
  expect(onValueChange).toHaveBeenLastCalledWith(0);

  await userEvent.click(indicator(1));
  await userEvent.keyboard('{ArrowLeft}');
  expect(onValueChange).toHaveBeenLastCalledWith(4);
});

test('inert: Tab reaches only the slides in view', async () => {
  await render(
    <Carousel aria-label="사진" slidesPerView={2}>
      {[1, 2, 3, 4].map((n) => (
        <Carousel.Slide key={n}>
          <a href={`#photo-${n}`}>사진 {n}</a>
        </Carousel.Slide>
      ))}
    </Carousel>,
  );

  await expect.poll(inertSlides).toEqual([3, 4]);
  await userEvent.keyboard('{Tab}{Tab}{Tab}');
  await expect.element(page.getByRole('link', { name: '사진 1' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(page.getByRole('link', { name: '사진 2' })).toHaveFocus();
  await userEvent.keyboard('{Tab}');
  await expect.element(indicator(1)).toHaveFocus();
});

test('motion: autoplay brings a Pause that holds until it is pressed again', async () => {
  const onPlayingChange = vi.fn();
  await render(
    <Photos before={outsideButton} autoplay defaultPlaying onPlayingChange={onPlayingChange} />,
  );
  await userEvent.hover(outside());

  await expect.element(pause()).toHaveAttribute('aria-pressed', 'false');
  await expect.element(region()).toHaveAttribute('data-playing');
  expect(announcer().getAttribute('aria-live')).toBe('off');

  await userEvent.click(pause());
  expect(onPlayingChange).toHaveBeenLastCalledWith(false);
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'true');
  await expect.element(region()).not.toHaveAttribute('data-playing');
  expect(announcer().getAttribute('aria-live')).toBe('polite');

  await userEvent.click(next());
  await userEvent.hover(outside());
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'true');
  await expect.element(region()).not.toHaveAttribute('data-playing');

  await userEvent.click(pause());
  expect(onPlayingChange).toHaveBeenLastCalledWith(true);
  await expect.element(region()).toHaveAttribute('data-playing');
});

test('motion: hovering the slides or keyboard focus inside pauses only while it lasts', async () => {
  await render(<Photos before={outsideButton} autoplay defaultPlaying />);

  await userEvent.hover(slide(1));
  await expect.element(region()).not.toHaveAttribute('data-playing');
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'false');
  expect(announcer().getAttribute('aria-live')).toBe('polite');
  await userEvent.hover(outside());
  await expect.element(region()).toHaveAttribute('data-playing');

  await userEvent.click(outside());
  await userEvent.keyboard('{Tab}');
  await expect.element(previous()).toHaveFocus();
  await expect.element(region()).not.toHaveAttribute('data-playing');

  await userEvent.keyboard('{Tab}{Tab}{Tab}{Tab}{Tab}{Tab}{Tab}');
  await expect.element(pause()).toHaveFocus();
  await expect.element(region()).toHaveAttribute('data-playing');

  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(indicator(5)).toHaveFocus();
  await expect.element(region()).not.toHaveAttribute('data-playing');

  await userEvent.click(outside());
  await expect.element(region()).toHaveAttribute('data-playing');
});

test('motion: a finger held on the slides pauses rotation until it lifts', async (context) => {
  skipWithoutCdp(context);
  await render(<Photos before={outsideButton} autoplay defaultPlaying />);
  await userEvent.hover(outside());
  const point = centerOf(slide(1).element());

  await touch('touchStart', [point]);
  await expect.element(region()).toHaveAttribute('data-dragging');
  await expect.element(region()).not.toHaveAttribute('data-playing');
  await touch('touchEnd', []);
  await expect.element(region()).not.toHaveAttribute('data-dragging');
  await expect.element(region()).toHaveAttribute('data-playing');
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'false');
});

test('motion: with reduced motion preferred, autoplay starts paused', async () => {
  await render(<Photos autoplay />);

  await expect.element(pause()).toHaveAttribute('aria-pressed', 'true');
  await expect.element(region()).not.toHaveAttribute('data-playing');
  expect(announcer().getAttribute('aria-live')).toBe('polite');
});

test('motion: with no motion preference, autoplay starts playing', async (context) => {
  skipWithoutCdp(context);
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });
  onTestFinished(async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  });

  await render(<Photos before={outsideButton} autoplay />);
  await userEvent.hover(outside());
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'false');
  await expect.element(region()).toHaveAttribute('data-playing');
});

test('motion: autoplay moves on after the delay, and a paused carousel stays put', async () => {
  const onValueChange = vi.fn();
  await render(
    <Photos
      before={outsideButton}
      autoplay={{ delay: 60 }}
      defaultPlaying
      onValueChange={onValueChange}
    />,
  );
  await userEvent.hover(outside());

  await expect.poll(() => onValueChange.mock.calls.length, { timeout: 3000 }).toBeGreaterThan(1);
  await userEvent.click(pause());
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'true');
  const moves = onValueChange.mock.calls.length;
  await wait(400);
  expect(onValueChange).toHaveBeenCalledTimes(moves);
});

test('motion: autoScroll flows past the snaps, and Pause stops the track', async () => {
  const onValueChange = vi.fn();
  await render(
    <Photos
      before={outsideButton}
      count={8}
      slidesPerView={3}
      loop
      autoScroll={{ speed: 20 }}
      defaultPlaying
      onValueChange={onValueChange}
    />,
  );
  await userEvent.hover(outside());

  await expect.poll(() => onValueChange.mock.calls.length, { timeout: 5000 }).toBeGreaterThan(0);
  await userEvent.click(pause());
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'true');
  const stopped = trackOffset();
  await wait(300);
  expect(Math.abs(trackOffset() - stopped)).toBeLessThan(1);
});

test('motion: autoScroll without loop pauses at the end, and playing again starts over', async () => {
  const onPlayingChange = vi.fn();
  const onValueChange = vi.fn();
  await render(
    <Photos
      before={outsideButton}
      count={4}
      slidesPerView={2}
      autoScroll={{ speed: 40 }}
      defaultPlaying
      onPlayingChange={onPlayingChange}
      onValueChange={onValueChange}
    />,
  );
  await userEvent.hover(outside());

  await expect.element(pause(), { timeout: 5000 }).toHaveAttribute('aria-pressed', 'true');
  expect(onPlayingChange).toHaveBeenLastCalledWith(false);
  expect(onValueChange).toHaveBeenLastCalledWith(2);

  await userEvent.click(pause());
  expect(onValueChange).toHaveBeenLastCalledWith(0);
  await expect.element(pause()).toHaveAttribute('aria-pressed', 'false');
  await expect.element(region()).toHaveAttribute('data-playing');
});

test('motion: without autoplay or autoScroll there is no Pause and the announcer stays polite', async () => {
  await render(<Photos />);

  await expect.element(region()).toBeInTheDocument();
  expect(pause().query()).toBeNull();
  expect(region().element().hasAttribute('data-playing')).toBe(false);
  expect(announcer().getAttribute('aria-live')).toBe('polite');
  expect(announcer().textContent).toBe('5장 중 1번째');
  await userEvent.click(next());
  await expect.poll(() => announcer().textContent).toBe('5장 중 2번째');
});

test('parts: placed controls replace the defaults, and autoplay still brings a Pause', async () => {
  await render(
    <Carousel aria-label="사진" autoplay>
      <div>
        <Carousel.Prev variant="ghost" />
        <Carousel.Next variant="ghost" />
      </div>
      <Carousel.Content className="gap-4">
        {[1, 2, 3].map((n) => (
          <Carousel.Slide key={n}>사진 {n}</Carousel.Slide>
        ))}
      </Carousel.Content>
    </Carousel>,
  );

  await expect.element(pause()).toBeInTheDocument();
  expect(next().elements()).toHaveLength(1);
  expect(next().element().getAttribute('data-variant')).toBe('ghost');
  expect(document.querySelectorAll('[data-carousel-indicator]')).toHaveLength(0);
  await expect
    .poll(() =>
      document
        .querySelector<HTMLElement>('[data-slides-track]')!
        .style.getPropertyValue('--slides-gap'),
    )
    .toBe('16px');
});

test('parts: a Content alone keeps the default arrows and indicators', async () => {
  await render(
    <Carousel aria-label="사진">
      <Carousel.Content className="gap-2">
        {[1, 2, 3].map((n) => (
          <Carousel.Slide key={n}>사진 {n}</Carousel.Slide>
        ))}
      </Carousel.Content>
    </Carousel>,
  );

  await expect.element(next()).toBeInTheDocument();
  expect(next().element().closest('[data-carousel-content]')).not.toBeNull();
  expect(indicatorLabels()).toHaveLength(3);
});

test('parts: a single slide has nothing to navigate', async () => {
  await render(<Photos count={1} />);

  await expect.element(slide(1, 1)).toHaveAttribute('data-selected');
  expect(next().query()).toBeNull();
  expect(indicatorLabels()).toEqual([]);
});

test('warnings: no name, a slide outside Carousel.Content, and two motions at once', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(
    // @ts-expect-error a carousel needs aria-label or aria-labelledby
    <Carousel autoplay autoScroll>
      <Carousel.Content>
        <Carousel.Slide>사진 1</Carousel.Slide>
      </Carousel.Content>
      <Carousel.Slide>사진 2</Carousel.Slide>
    </Carousel>,
  );

  const warned = () => warn.mock.calls.flat().join('\n');
  await expect.poll(warned).toContain('[IDS] Carousel: give the carousel a name');
  expect(warned()).toContain('[IDS] Carousel.Slide must be a child of Carousel.Content');
  expect(warned()).toContain('[IDS] Carousel: autoplay and autoScroll cannot run together');
  expect(document.querySelectorAll('[data-carousel-slide]')).toHaveLength(1);
});

test('drag: a mouse drag moves to the next slide, and a controlled owner can refuse it', async (context) => {
  skipWithoutCdp(context);
  const onValueChange = vi.fn();
  const screen = await render(<Photos onValueChange={onValueChange} />);

  await dragAcross(slide(1).element(), -260);
  await expect.poll(() => onValueChange.mock.calls.at(-1)).toEqual([1]);
  await expect.element(slide(2)).toHaveAttribute('data-selected');
  await restsOn(2);

  onValueChange.mockClear();
  await screen.rerender(<Photos value={1} onValueChange={onValueChange} />);
  await dragAcross(slide(2).element(), -260);
  await expect.poll(() => onValueChange.mock.calls.at(-1)).toEqual([2]);
  await expect.element(slide(2)).toHaveAttribute('data-selected');
  await restsOn(2);
  await expect.poll(inertSlides).toEqual([1, 3, 4, 5]);
});

type ViewerProps = {
  refuseDrag?: (event: SlidesDragEvent) => boolean;
  loop?: boolean;
  onValueChange?: (value: number) => void;
};

function Viewer({ refuseDrag = () => false, loop, onValueChange }: ViewerProps) {
  const {
    viewportRef,
    trackProps,
    slideProps,
    dragging,
    selected,
    direction,
    scrollTo,
    scrollPrev,
    cancelDrag,
  } = useSlides({
    slideCount: 3,
    loop,
    onValueChange,
    watchDrag: (_api, event) => !refuseDrag(event),
  });

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Escape') cancelDrag();
      }}
    >
      <button type="button" onClick={() => scrollTo(2, true)}>
        셋째로
      </button>
      <button type="button" onClick={() => scrollPrev()}>
        앞으로
      </button>
      <div
        ref={viewportRef}
        data-testid="viewer"
        data-dragging={dragging ? '' : undefined}
        data-selected-snap={selected}
        data-direction={direction}
        className={slidesLayout.viewport}
      >
        <div {...trackProps} className={slidesLayout.track.horizontal}>
          {[0, 1, 2].map((index) => (
            <div key={index} {...slideProps(index)} className={slidesLayout.slide}>
              <div className="h-40 touch-none">그림 {index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const viewerSlide = (n: number) => page.getByRole('group', { name: `3장 중 ${n}번째` });

const viewerRestsOn = (n: number) =>
  expect
    .poll(() => {
      const view = page.getByTestId('viewer').element().getBoundingClientRect();
      return Math.abs(viewerSlide(n).element().getBoundingClientRect().left - view.left);
    })
    .toBeLessThan(1);

test('engine: slides carry the ARIA the owner spreads, and only the track sets touch-action', async () => {
  const screen = await render(<Viewer />);

  await expect.element(viewerSlide(1)).toHaveAttribute('aria-roledescription', '슬라이드');
  await expect.element(viewerSlide(2)).toHaveAttribute('inert');
  const track = document.querySelector('[data-slides-track]')!;
  expect(getComputedStyle(track).touchAction).toBe('pan-y pinch-zoom');
  expect(getComputedStyle(viewerSlide(1).element()).touchAction).toBe('auto');
  expect(getComputedStyle(screen.getByText('그림 1').element()).touchAction).toBe('none');
});

test('engine: scrollTo, scrollPrev, loop and onValueChange bind to the owner', async () => {
  const onValueChange = vi.fn();
  await render(<Viewer loop onValueChange={onValueChange} />);

  await userEvent.click(page.getByRole('button', { name: '셋째로' }));
  expect(onValueChange).toHaveBeenLastCalledWith(2);
  await expect.element(page.getByTestId('viewer')).toHaveAttribute('data-selected-snap', '2');
  await viewerRestsOn(3);

  await userEvent.click(page.getByRole('button', { name: '앞으로' }));
  await userEvent.click(page.getByRole('button', { name: '앞으로' }));
  await userEvent.click(page.getByRole('button', { name: '앞으로' }));
  expect(onValueChange.mock.calls).toEqual([[2], [1], [0], [2]]);
});

test('engine: it handles no keys of its own and reads right to left from the page', async () => {
  const onValueChange = vi.fn();
  await render(
    <div dir="rtl">
      <Viewer onValueChange={onValueChange} />
    </div>,
  );

  await expect.element(page.getByTestId('viewer')).toHaveAttribute('data-direction', 'rtl');
  await userEvent.click(page.getByRole('button', { name: '셋째로' }));
  await expect
    .poll(() => centerOf(viewerSlide(3).element()).x > centerOf(viewerSlide(2).element()).x)
    .toBe(false);
  onValueChange.mockClear();
  viewerSlide(3).element().focus();
  await userEvent.keyboard('{ArrowLeft}{ArrowRight}{Home}{End}');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('engine: the drag guard sees the pointer at press and can refuse mouse drags', async (context) => {
  skipWithoutCdp(context);
  const seen: string[] = [];
  const onValueChange = vi.fn();
  await render(
    <Viewer
      onValueChange={onValueChange}
      refuseDrag={(event) => {
        seen.push(event.type);
        return event.type === 'mousedown';
      }}
    />,
  );
  const viewer = page.getByTestId('viewer');

  await dragAcross(viewer.element(), -260);
  await wait(100);
  expect(seen).toContain('mousedown');
  expect(onValueChange).not.toHaveBeenCalled();
  await expect.element(viewer).toHaveAttribute('data-selected-snap', '0');

  const start = centerOf(viewer.element());
  await touch('touchStart', [start]);
  await touch('touchMove', [{ x: start.x - 130, y: start.y }]);
  await touch('touchMove', [{ x: start.x - 260, y: start.y }]);
  await touch('touchEnd', []);
  expect(seen).toContain('touchstart');
  await expect.poll(() => onValueChange.mock.calls.at(-1)).toEqual([1]);
});

test('engine: cancelDrag drops a drag in progress and snaps back to the current slide', async (context) => {
  skipWithoutCdp(context);
  const onValueChange = vi.fn();
  await render(<Viewer onValueChange={onValueChange} />);
  const viewer = page.getByTestId('viewer');
  const start = centerOf(viewerSlide(1).element());

  await mouse('mousePressed', start);
  await mouse('mouseMoved', { x: start.x - 60, y: start.y });
  await mouse('mouseMoved', { x: start.x - 120, y: start.y });
  await expect.element(viewer).toHaveAttribute('data-dragging');
  await userEvent.keyboard('{Escape}');
  await expect.element(viewer).not.toHaveAttribute('data-dragging');
  await viewerRestsOn(1);

  await mouse('mouseMoved', { x: start.x - 300, y: start.y });
  await mouse('mouseReleased', { x: start.x - 300, y: start.y });
  await wait(100);
  await viewerRestsOn(1);
  expect(onValueChange).not.toHaveBeenCalled();
});

test('engine: a second finger releases the drag at once for a pinch', async (context) => {
  skipWithoutCdp(context);
  const onValueChange = vi.fn();
  await render(<Viewer onValueChange={onValueChange} />);
  const viewer = page.getByTestId('viewer');
  const start = centerOf(viewer.element());

  await touch('touchStart', [start]);
  await touch('touchMove', [{ x: start.x - 90, y: start.y }]);
  await expect.element(viewer).toHaveAttribute('data-dragging');
  await touch('touchStart', [
    { x: start.x - 90, y: start.y },
    { x: start.x + 40, y: start.y + 40 },
  ]);
  await expect.element(viewer).not.toHaveAttribute('data-dragging');
  await viewerRestsOn(1);

  await touch('touchMove', [
    { x: start.x - 280, y: start.y },
    { x: start.x + 80, y: start.y + 80 },
  ]);
  await touch('touchEnd', []);
  await wait(100);
  await viewerRestsOn(1);
  expect(onValueChange).not.toHaveBeenCalled();
});
