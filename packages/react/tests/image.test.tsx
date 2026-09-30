import { createRef, type ReactNode } from 'react';

import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { Image } from '../src';
import { skipWithoutCdp } from './engines';

const PICTURE = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"/>';
const INLINE_PICTURE = `data:image/svg+xml;base64,${btoa(PICTURE)}`;
const BROKEN = 'data:image/png;base64,AAAA';
const HELD = '/__held-image__/';
const lazyImagesStartLateOnASlowRunner = 5_000;
const GAP = 8;

const frameOf = (container: Element) => container.querySelector<HTMLElement>('[data-image]')!;

const serverFrame = (node: ReactNode) =>
  new DOMParser()
    .parseFromString(renderToString(node), 'text/html')
    .querySelector<HTMLElement>('[data-image]')!;

async function cdpReadyForListeners() {
  const session = cdp();
  await session.send('Fetch.disable');
  return session;
}

async function holdImages() {
  const session = await cdpReadyForListeners();
  const paused = new Map<string, string>();
  const onPaused = (event: { requestId: string; request: { url: string } }) => {
    paused.set(new URL(event.request.url).pathname, event.requestId);
  };
  session.on('Fetch.requestPaused', onPaused);
  await session.send('Fetch.enable', { patterns: [{ urlPattern: `*${HELD}*` }] });
  onTestFinished(async () => {
    session.off('Fetch.requestPaused', onPaused);
    await session.send('Fetch.disable');
  });
  const requestOf = async (src: string) => {
    await expect
      .poll(() => paused.get(src), {
        message: `${src} is requested`,
        timeout: lazyImagesStartLateOnASlowRunner,
      })
      .toBeDefined();
    return paused.get(src)!;
  };
  return {
    async load(src: string) {
      await session.send('Fetch.fulfillRequest', {
        requestId: await requestOf(src),
        responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'image/svg+xml' }],
        body: btoa(PICTURE),
      });
    },
    async fail(src: string) {
      await session.send('Fetch.failRequest', {
        requestId: await requestOf(src),
        errorReason: 'Failed',
      });
    },
  };
}

test('SSR: a plain img with its alt, lazily loaded, over a Skeleton hidden from screen readers', () => {
  const frame = serverFrame(<Image src="/lake.jpg" alt="Lake at dawn" />);
  expect(frame.dataset.status).toBe('loading');
  expect(frame.hasAttribute('data-preview')).toBe(false);
  const img = frame.querySelector('img')!;
  expect(img.getAttribute('src')).toBe('/lake.jpg');
  expect(img.getAttribute('alt')).toBe('Lake at dawn');
  expect(img.getAttribute('loading')).toBe('lazy');
  expect(img.getAttribute('decoding')).toBe('async');
  const placeholder = frame.querySelector('[data-image-placeholder]')!;
  expect(placeholder.getAttribute('aria-hidden')).toBe('true');
  expect(placeholder.hasAttribute('data-skeleton')).toBe(true);
  expect(placeholder.getAttribute('data-animation')).toBe('pulse');
  expect(frame.querySelector('button'), 'only a previewable image is a button').toBeNull();
});

test('the Skeleton placeholder fills the image box while it loads', async (context) => {
  skipWithoutCdp(context);
  await holdImages();
  const screen = await render(
    <div style={{ width: 240 }}>
      <Image src={`${HELD}box.png`} alt="Lake at dawn" ratio={2} />
    </div>,
  );
  const placeholder = screen.container.querySelector<HTMLElement>('[data-image-placeholder]')!;
  await expect.element(placeholder).toBeVisible();
  const box = frameOf(screen.container).getBoundingClientRect();
  const painted = placeholder.getBoundingClientRect();
  expect(painted.width).toBeCloseTo(box.width, 0);
  expect(painted.height).toBeCloseTo(box.height, 0);
});

test('SSR: a custom placeholder replaces the Skeleton', () => {
  const frame = serverFrame(
    <Image src="/lake.jpg" alt="Lake at dawn">
      <Image.Placeholder>Loading the photo</Image.Placeholder>
    </Image>,
  );
  const placeholder = frame.querySelector('[data-image-placeholder]')!;
  expect(placeholder.textContent).toBe('Loading the photo');
  expect(placeholder.hasAttribute('data-skeleton')).toBe(false);
  expect(placeholder.getAttribute('aria-hidden')).toBe('true');
});

test('without src the fallback stands for the picture at once, and hides when decorative', () => {
  const named = serverFrame(<Image alt="Not uploaded yet" />);
  expect(named.dataset.status).toBe('error');
  expect(named.querySelector('img')).toBeNull();
  const fallback = named.querySelector('[data-image-fallback]')!;
  expect(fallback.getAttribute('role')).toBe('img');
  expect(fallback.getAttribute('aria-label')).toBe('Not uploaded yet');
  expect(fallback.querySelector('svg')).not.toBeNull();

  const decorative = serverFrame(<Image alt="" />);
  expect(decorative.querySelector('[data-image-fallback]')!.getAttribute('aria-hidden')).toBe(
    'true',
  );
});

test('the placeholder shows while loading, then a load or an error moves the status', async (context) => {
  skipWithoutCdp(context);
  const images = await holdImages();
  const statuses: Image.Status[] = [];
  const photo = (src: string) => (
    <div style={{ width: 200 }}>
      <Image src={src} alt="Lake at dawn" ratio={4 / 3} onStatusChange={(s) => statuses.push(s)} />
    </div>
  );
  const screen = await render(photo(`${HELD}a.png`));
  const frame = frameOf(screen.container);

  await expect.element(frame).toHaveAttribute('data-status', 'loading');
  expect(frame.querySelector('[data-image-placeholder]')).not.toBeNull();
  await images.load(`${HELD}a.png`);
  await expect.element(frame).toHaveAttribute('data-status', 'loaded');
  expect(frame.querySelector('[data-image-placeholder]')).toBeNull();

  await screen.rerender(photo(`${HELD}b.png`));
  await expect
    .element(frame, { message: 'a new src starts over' })
    .toHaveAttribute('data-status', 'loading');
  await images.fail(`${HELD}b.png`);
  await expect.element(frame).toHaveAttribute('data-status', 'error');
  expect(frame.querySelector('img'), 'a broken img leaves the DOM').toBeNull();
  await expect
    .element(screen.getByRole('img', { name: 'Lake at dawn' }))
    .toHaveAttribute('data-image-fallback');
  await expect.poll(() => statuses).toEqual(['loading', 'loaded', 'loading', 'error']);
});

test('an image that loaded before hydration is read on mount', async () => {
  const image = <Image src={INLINE_PICTURE} alt="Lake at dawn" />;
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(image);
  const img = container.querySelector('img')!;
  await new Promise((resolve) => img.addEventListener('load', resolve, { once: true }));
  const root = hydrateRoot(container, image);
  onTestFinished(() => {
    root.unmount();
    container.remove();
  });
  await expect.element(frameOf(container)).toHaveAttribute('data-status', 'loaded');
});

test('ratio sizes the box through AspectRatio, and a broken image keeps its box', async () => {
  const screen = await render(
    <div style={{ width: 300 }}>
      <Image src={INLINE_PICTURE} alt="Lake at dawn" ratio={2} />
    </div>,
  );
  const frame = frameOf(screen.container);
  await expect.element(frame).toHaveAttribute('data-aspect-ratio');
  expect(frame.getBoundingClientRect().height).toBeCloseTo(150, 0);

  await screen.rerender(
    <div style={{ width: 300 }}>
      <Image src={BROKEN} alt="Broken" width={400} height={100} />
    </div>,
  );
  const broken = frameOf(screen.container);
  await expect.element(broken).toHaveAttribute('data-status', 'error');
  expect(broken.getBoundingClientRect().height, 'the width and height ratio').toBeCloseTo(75, 0);

  await screen.rerender(
    <div style={{ width: 300 }}>
      <Image src={BROKEN} alt="Broken" />
    </div>,
  );
  expect(frameOf(screen.container).getBoundingClientRect().height, '4:3').toBeCloseTo(225, 0);
});

test('native attributes and ref reach the img, className and state reach the box', async () => {
  const ref = createRef<HTMLImageElement>();
  const screen = await render(
    <Image
      ref={ref}
      id="lake"
      src={INLINE_PICTURE}
      alt="Lake at dawn"
      loading="eager"
      referrerPolicy="no-referrer"
      fetchPriority="high"
      className={(state) => `w-20 status-${state.status}`}
      style={{ outlineColor: 'red' }}
    />,
  );
  const frame = frameOf(screen.container);
  const img = screen.container.querySelector('img')!;
  expect(ref.current).toBe(img);
  expect(img.id).toBe('lake');
  expect(img.getAttribute('loading')).toBe('eager');
  expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
  expect(img.getAttribute('fetchpriority')).toBe('high');
  await expect.element(frame).toHaveClass('w-20');
  await expect.element(frame).toHaveClass('status-loaded');
  expect(frame.style.outlineColor).toBe('red');
});

test('a missing alt, and a previewable image without one, warn in development', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  // @ts-expect-error alt is required, and the warning is for code that is not typed
  await render(<Image src={INLINE_PICTURE} />);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('pass alt'));

  warn.mockClear();
  await render(<Image src={INLINE_PICTURE} alt="" preview />);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('opens the viewer'));
});

test('a previewable image is one button named after its alt that opens a dialog', async () => {
  const screen = await render(<Image src={INLINE_PICTURE} alt="Lake at dawn" preview />);
  const button = screen.getByRole('button', { name: 'Lake at dawn 크게 보기' });
  await expect.element(button).toHaveAttribute('aria-haspopup', 'dialog');
  await expect.element(button).toHaveAttribute('aria-expanded', 'false');
  expect(button.element().querySelector('img')).not.toBeNull();
  expect(frameOf(screen.container)).toHaveAttribute('data-preview');

  await userEvent.click(button);
  await expect.element(button).toHaveAttribute('aria-expanded', 'true');
});

test('the focus ring is drawn on the image box while its button has keyboard focus', async () => {
  const screen = await render(<Image src={INLINE_PICTURE} alt="Lake at dawn" preview />);
  const frame = frameOf(screen.container);
  expect(getComputedStyle(frame).boxShadow).toBe('none');

  await userEvent.keyboard('{Tab}');
  await expect
    .element(screen.getByRole('button', { name: 'Lake at dawn 크게 보기' }))
    .toHaveFocus();
  await expect.poll(() => getComputedStyle(frame).boxShadow).not.toBe('none');
});

test('Image.Group lists its images and opens the viewer at the pressed one, by pointer and keys', async () => {
  const onValueChange = vi.fn();
  const onOpenChange = vi.fn();
  const screen = await render(
    <Image.Group aria-label="Photos" onValueChange={onValueChange} onOpenChange={onOpenChange}>
      <Image src={INLINE_PICTURE} alt="First" />
      <Image src={INLINE_PICTURE} alt="Second" preview={false} />
      <Image src={INLINE_PICTURE} alt="Third" />
    </Image.Group>,
  );
  await expect.element(screen.getByRole('list', { name: 'Photos' })).toBeInTheDocument();
  expect(screen.getByRole('listitem').all()).toHaveLength(3);
  expect(screen.getByRole('button').all(), 'preview={false} opts one image out').toHaveLength(2);

  const first = screen.getByRole('button', { name: 'First 크게 보기' });
  const third = screen.getByRole('button', { name: 'Third 크게 보기' });
  await userEvent.click(third);
  expect(onValueChange.mock.calls).toEqual([[1]]);
  expect(onOpenChange.mock.calls).toEqual([[true]]);
  await expect.element(third).toHaveAttribute('aria-expanded', 'true');

  await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
  await expect.element(first).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  expect(onValueChange.mock.calls).toEqual([[1], [0]]);
  expect(onOpenChange.mock.calls, 'already open').toEqual([[true]]);
  await expect.element(first).toHaveAttribute('aria-expanded', 'true');
  await expect.element(third).toHaveAttribute('aria-expanded', 'false');
});

test('a controlled group marks the image it shows, and indexes follow the document order', async () => {
  const onValueChange = vi.fn();
  const gallery = (names: string[], value: number) => (
    <Image.Group value={value} open onValueChange={onValueChange}>
      {names.map((name) => (
        <Image key={name} src={INLINE_PICTURE} alt={name} />
      ))}
    </Image.Group>
  );
  const screen = await render(gallery(['A', 'B', 'C'], 2));
  await expect
    .element(screen.getByRole('button', { name: 'C 크게 보기' }))
    .toHaveAttribute('aria-expanded', 'true');

  await screen.rerender(gallery(['C', 'A', 'B'], 2));
  await userEvent.click(screen.getByRole('button', { name: 'A 크게 보기' }));
  expect(onValueChange).toHaveBeenLastCalledWith(1);
  await expect
    .element(screen.getByRole('button', { name: 'B 크게 보기' }))
    .toHaveAttribute('aria-expanded', 'true');
});

test('the group lays images in a row, a column or a grid of columns', async () => {
  const photos = (count: number) =>
    Array.from({ length: count }, (_, index) => (
      <Image key={index} src={INLINE_PICTURE} alt={`Photo ${index + 1}`} ratio={1} />
    ));
  const screen = await render(
    <div style={{ width: 300 }}>
      <Image.Group layout="grid" columns={3} aria-label="Grid">
        {photos(6)}
      </Image.Group>
    </div>,
  );
  const cells = screen.getByRole('listitem').elements();
  const tile = (300 - 2 * GAP) / 3;
  expect(cells[0]!.getBoundingClientRect().width).toBeCloseTo(tile, 0);
  expect(cells[2]!.getBoundingClientRect().top).toBeCloseTo(
    cells[0]!.getBoundingClientRect().top,
    0,
  );
  expect(cells[3]!.getBoundingClientRect().top).toBeCloseTo(
    cells[0]!.getBoundingClientRect().bottom + GAP,
    0,
  );

  await screen.rerender(
    <div style={{ width: 300 }}>
      <Image.Group layout="row" aria-label="Row">
        {photos(2)}
      </Image.Group>
    </div>,
  );
  const [left, right] = screen.getByRole('listitem').elements();
  expect(left!.getBoundingClientRect().width).toBeCloseTo((300 - GAP) / 2, 0);
  expect(right!.getBoundingClientRect().left).toBeCloseTo(
    left!.getBoundingClientRect().right + GAP,
    0,
  );

  await screen.rerender(
    <div style={{ width: 300 }}>
      <Image.Group layout="column" aria-label="Column">
        {photos(2)}
      </Image.Group>
    </div>,
  );
  const [top, bottom] = screen.getByRole('listitem').elements();
  expect(top!.getBoundingClientRect().width).toBeCloseTo(300, 0);
  expect(bottom!.getBoundingClientRect().top).toBeCloseTo(
    top!.getBoundingClientRect().bottom + GAP,
    0,
  );
});

test('a group with columns that are not a positive whole number throws, and parts need an Image', () => {
  expect(() => renderToString(<Image.Group layout="grid" columns={0} />)).toThrow(/columns/);
  expect(() => renderToString(<Image.Fallback />)).toThrow(/inside `<Image>`/);
});
