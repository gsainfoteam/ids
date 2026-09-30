import { type ReactNode } from 'react';

import { renderToString } from 'react-dom/server';
import { expect, onTestFinished, test, vi } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { IdsProvider, Image, overlay } from '../src';
import { skipWithoutCdp } from './engines';

type Point = { x: number; y: number };

const picture = (hue: number, width = 1600, height = 1200) =>
  `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="hsl(${hue} 60% 60%)"/></svg>`,
  )}`;

const PHOTOS = [
  { alt: 'First', src: picture(10), caption: 'Morning lake' },
  { alt: 'Second', src: picture(120), caption: 'Hills at dusk' },
  { alt: 'Third', src: picture(240), caption: undefined },
];

function Gallery({ viewer, ...props }: Partial<Image.Group.Props> & { viewer?: ReactNode }) {
  return (
    <IdsProvider>
      <div style={{ width: 300 }}>
        <Image.Group aria-label="Photos" layout="grid" columns={3} {...props}>
          {PHOTOS.map((photo) => (
            <Image
              key={photo.alt}
              src={photo.src}
              alt={photo.alt}
              caption={photo.caption}
              ratio={1}
            />
          ))}
          {viewer}
        </Image.Group>
      </div>
    </IdsProvider>
  );
}

const dialog = () => page.getByRole('dialog', { name: '사진 보기' });
const counter = () => document.querySelector('[data-image-viewer-counter]');
const announcer = () => document.querySelector('[data-slides-announcer]')!;
const currentBox = () =>
  document.querySelector<HTMLElement>('[data-slide][data-selected] [data-image-viewer-box]')!;
const scaleOf = (element: Element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a;

async function openAt(alt: string) {
  await userEvent.click(page.getByRole('button', { name: `${alt} 크게 보기` }));
  await expect.element(page.getByRole('dialog')).toBeVisible();
}

const frameOffset = (point: Point) => {
  const frame = window.frameElement!.getBoundingClientRect();
  const scale = frame.width / window.innerWidth;
  return { x: frame.left + point.x * scale, y: frame.top + point.y * scale };
};

const centerOf = (element: Element): Point => {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

const FRAME_MS = 16;
let inputClock = Date.now();

const inputTimestamp = ({ startsGesture }: { startsGesture: boolean }) => {
  inputClock = startsGesture ? Math.max(Date.now(), inputClock + FRAME_MS) : inputClock + FRAME_MS;
  return inputClock / 1000;
};

async function mouse(type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', point: Point) {
  await cdp().send('Input.dispatchMouseEvent', {
    type,
    ...frameOffset(point),
    button: 'left',
    buttons: type === 'mouseReleased' ? 0 : 1,
    clickCount: 1,
    timestamp: inputTimestamp({ startsGesture: type === 'mousePressed' }),
  });
}

async function touch(type: 'touchStart' | 'touchMove' | 'touchEnd', fingers: Point[]) {
  await cdp().send('Input.dispatchTouchEvent', {
    type,
    touchPoints: fingers.map((point, finger) => ({ ...frameOffset(point), id: finger })),
    timestamp: inputTimestamp({ startsGesture: type === 'touchStart' && fingers.length === 1 }),
  });
}

async function motionOn() {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }],
  });
  onTestFinished(async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  });
}

test('SSR: an open group renders no viewer on the server', () => {
  const html = renderToString(<Gallery defaultOpen />);
  expect(html).toContain('<img');
  expect(html).not.toContain('role="dialog"');
  expect(renderToString(<Image.Viewer items={PHOTOS} defaultOpen />)).toBe('');
});

test('pressing an image opens a modal viewer at it, and Escape closes it back to the thumbnail', async () => {
  const onOpenChange = vi.fn();
  const onValueChange = vi.fn();
  await render(<Gallery onOpenChange={onOpenChange} onValueChange={onValueChange} />);

  await openAt('Second');
  await expect.element(dialog()).toHaveAttribute('aria-modal', 'true');
  await expect.element(dialog()).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true]]);
  expect(onValueChange.mock.calls).toEqual([[1]]);

  const shown = page.getByRole('group', { name: '3장 중 2번째' });
  await expect.element(shown).toHaveAttribute('data-selected');
  await expect.element(shown).toHaveAttribute('aria-roledescription', '슬라이드');
  await expect.element(shown.getByRole('img', { name: 'Second' })).toBeVisible();
  expect(counter()?.textContent).toBe('2 / 3');
  expect(announcer().getAttribute('aria-live')).toBe('polite');
  expect(announcer().textContent).toContain('3장 중 2번째');
  await expect
    .element(page.getByRole('region', { name: '사진' }))
    .toHaveAttribute('aria-roledescription', '캐러셀');

  await userEvent.keyboard('{Escape}');
  await expect.element(dialog()).not.toBeInTheDocument();
  await expect.element(page.getByRole('button', { name: 'Second 크게 보기' })).toHaveFocus();
  expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
});

test('arrows, Home and End move between the images, and the ends stay without loop', async () => {
  const onValueChange = vi.fn();
  await render(<Gallery onValueChange={onValueChange} />);
  await openAt('First');

  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(counter).toHaveTextContent('2 / 3');
  await expect.poll(() => announcer().textContent).toContain('3장 중 2번째');
  await userEvent.keyboard('{End}');
  await expect.poll(counter).toHaveTextContent('3 / 3');
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(counter).toHaveTextContent('3 / 3');
  await userEvent.keyboard('{Home}');
  await expect.poll(counter).toHaveTextContent('1 / 3');
  await userEvent.keyboard('{ArrowLeft}');
  await expect.poll(counter).toHaveTextContent('1 / 3');
  expect(onValueChange.mock.calls).toEqual([[1], [2], [0]]);
});

test('with loop the arrows wrap around, and in a right-to-left page they are mirrored', async () => {
  await render(
    <div dir="rtl">
      <Gallery loop />
    </div>,
  );
  await openAt('Third');

  await userEvent.keyboard('{ArrowLeft}');
  await expect.poll(counter).toHaveTextContent('1 / 3');
  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(counter).toHaveTextContent('3 / 3');
});

test('previous and next step through the images and turn disabled at the ends', async () => {
  await render(<Gallery />);
  await openAt('First');
  const previous = page.getByRole('button', { name: '이전 사진' });
  const next = page.getByRole('button', { name: '다음 사진' });

  await expect.element(previous).toBeDisabled();
  await userEvent.click(next);
  await expect.poll(counter).toHaveTextContent('2 / 3');
  await expect.element(previous).toBeEnabled();
  await userEvent.click(next);
  await expect.element(next).toBeDisabled();
  await userEvent.click(previous);
  await expect.poll(counter).toHaveTextContent('2 / 3');
});

test('keys and buttons zoom the image, arrows pan it while zoomed, and a new image starts fitted', async () => {
  const onZoomChange = vi.fn();
  await render(<Gallery onZoomChange={onZoomChange} />);
  await openAt('Second');
  const zoomIn = page.getByRole('button', { name: '확대' });
  const zoomOut = page.getByRole('button', { name: '축소' });
  await expect.element(zoomOut).toBeDisabled();

  await userEvent.keyboard('+');
  await expect.poll(() => scaleOf(currentBox())).toBe(2);
  expect(onZoomChange).toHaveBeenLastCalledWith(2);
  await expect.element(zoomOut).toBeEnabled();

  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(counter, { message: 'a zoomed image pans instead' }).toHaveTextContent('2 / 3');

  await userEvent.click(zoomOut);
  await expect.poll(() => scaleOf(currentBox())).toBe(1);
  await userEvent.click(zoomIn);
  await expect.poll(() => scaleOf(currentBox())).toBe(2);

  await userEvent.click(page.getByRole('button', { name: '다음 사진' }));
  await expect.poll(counter).toHaveTextContent('3 / 3');
  expect(onZoomChange).toHaveBeenLastCalledWith(1);
  await expect.poll(() => scaleOf(currentBox())).toBe(1);

  await userEvent.keyboard('+');
  await expect.poll(() => scaleOf(currentBox())).toBe(2);
  await userEvent.keyboard('0');
  await expect.poll(() => scaleOf(currentBox())).toBe(1);
});

test('thumbnails jump to an image and mark the one shown', async () => {
  await render(<Gallery />);
  await openAt('First');
  const thumbnails = page.getByRole('group', { name: '사진 목록' });
  await expect
    .element(thumbnails.getByRole('button', { name: 'First' }))
    .toHaveAttribute('aria-current', 'true');

  await userEvent.click(thumbnails.getByRole('button', { name: 'Third' }));
  await expect.poll(counter).toHaveTextContent('3 / 3');
  await expect
    .element(thumbnails.getByRole('button', { name: 'Third' }))
    .toHaveAttribute('aria-current', 'true');
  await expect
    .element(thumbnails.getByRole('button', { name: 'First' }))
    .not.toHaveAttribute('aria-current');
});

test('the caption follows the image shown, and download links to it', async () => {
  await render(<Gallery />);
  await openAt('Second');

  await expect.element(page.getByText('Hills at dusk')).toBeVisible();
  const download = page.getByRole('link', { name: '내려받기' });
  await expect.element(download).toHaveAttribute('href', PHOTOS[1]!.src);
  await expect.element(download).toHaveAttribute('download');

  await userEvent.keyboard('{ArrowRight}');
  await expect.poll(counter).toHaveTextContent('3 / 3');
  expect(document.querySelector('[data-image-viewer-caption]'), 'no caption').toBeNull();
  await expect.element(download).toHaveAttribute('href', PHOTOS[2]!.src);
});

test('a press on the empty stage closes the viewer, a press on the picture does not', async () => {
  const onOpenChange = vi.fn();
  await render(<Gallery onOpenChange={onOpenChange} />);
  await openAt('Second');

  await userEvent.click(currentBox());
  await expect.element(dialog()).toBeVisible();
  const stage = document.querySelector('[data-image-viewer-stage]')!;
  await userEvent.click(page.elementLocator(stage), { position: { x: 4, y: 90 } });
  await expect.element(dialog()).not.toBeInTheDocument();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

test('the close button closes and hands focus back to the pressed thumbnail', async () => {
  await render(<Gallery />);
  await openAt('Third');

  await userEvent.click(page.getByRole('button', { name: '닫기' }));
  await expect.element(dialog()).not.toBeInTheDocument();
  await expect.element(page.getByRole('button', { name: 'Third 크게 보기' })).toHaveFocus();
});

test('share shows only where the browser can share, and shares the image shown', async () => {
  const own = Object.getOwnPropertyDescriptor(navigator, 'share');
  onTestFinished(() => {
    if (own) Object.defineProperty(navigator, 'share', own);
    else delete (navigator as { share?: unknown }).share;
  });
  const viewer = (
    <Image.Viewer>
      <Image.Toolbar>
        <Image.Share />
        <Image.Close />
      </Image.Toolbar>
    </Image.Viewer>
  );

  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  await render(<Gallery viewer={viewer} />);
  await openAt('First');
  expect(document.querySelector('[data-image-viewer-toolbar]')).not.toBeNull();
  await expect.element(page.getByRole('button', { name: '공유하기' })).not.toBeInTheDocument();
  await userEvent.keyboard('{Escape}');

  const share = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'share', { value: share, configurable: true });
  await openAt('Second');
  await userEvent.click(page.getByRole('button', { name: '공유하기' }));
  expect(share).toHaveBeenCalledWith({ title: 'Second', url: PHOTOS[1]!.src });
});

test('a composed viewer draws only the parts it lists', async () => {
  await render(
    <Gallery
      viewer={
        <Image.Viewer aria-label="Gallery viewer">
          <Image.Toolbar>
            <Image.Counter />
            <Image.Close />
          </Image.Toolbar>
          <Image.Caption />
        </Image.Viewer>
      }
    />,
  );
  await openAt('First');

  await expect.element(page.getByRole('dialog', { name: 'Gallery viewer' })).toBeVisible();
  expect(counter()?.textContent).toBe('1 / 3');
  await expect.element(page.getByText('Morning lake')).toBeVisible();
  expect(document.querySelector('[data-image-viewer-thumbnails]')).toBeNull();
  expect(document.querySelector('[data-image-viewer-step]')).toBeNull();
  await expect.element(page.getByRole('button', { name: '확대' })).not.toBeInTheDocument();
});

test('one image with preview opens a viewer of that image alone', async () => {
  await render(
    <IdsProvider>
      <div style={{ width: 200 }}>
        <Image src={PHOTOS[0]!.src} alt="Lake at dawn" caption="Only one" preview ratio={1} />
      </div>
    </IdsProvider>,
  );
  await openAt('Lake at dawn');

  await expect.element(page.getByRole('group', { name: '1장 중 1번째' })).toBeVisible();
  await expect.element(page.getByText('Only one')).toBeVisible();
  expect(counter()).toBeNull();
  expect(document.querySelector('[data-image-viewer-step]')).toBeNull();
  expect(document.querySelector('[data-image-viewer-thumbnails]')).toBeNull();
  await userEvent.keyboard('{Escape}');
  await expect.element(page.getByRole('button', { name: 'Lake at dawn 크게 보기' })).toHaveFocus();
});

test('a standalone viewer takes items, and overlay.open opens one and removes it when closed', async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <IdsProvider>
      <Image.Viewer items={PHOTOS} defaultOpen defaultValue={1} onValueChange={onValueChange} />
    </IdsProvider>,
  );
  await expect.element(dialog()).toBeVisible();
  expect(counter()?.textContent).toBe('2 / 3');
  await userEvent.keyboard('{ArrowLeft}');
  expect(onValueChange).toHaveBeenLastCalledWith(0);
  await userEvent.keyboard('{Escape}');
  await expect.element(dialog()).not.toBeInTheDocument();
  await screen.unmount();

  await render(<IdsProvider />);
  const closed = overlay.open(() => <Image.Viewer items={PHOTOS} defaultValue={2} />);
  await expect.element(dialog()).toBeVisible();
  expect(counter()?.textContent).toBe('3 / 3');
  await userEvent.keyboard('{Escape}');
  await expect.element(dialog()).not.toBeInTheDocument();
  await expect(closed).resolves.toBeUndefined();
  await expect.poll(() => document.querySelector('[data-overlay-item]')).toBeNull();
});

test('an image that cannot load shows a notice in its place', async () => {
  await render(
    <IdsProvider>
      <Image.Viewer items={[{ src: 'data:image/png;base64,broken', alt: 'Broken' }]} defaultOpen />
    </IdsProvider>,
  );

  await expect.element(page.getByText('사진을 불러오지 못했습니다')).toBeVisible();
  await expect.element(page.getByRole('img', { name: 'Broken' })).toBeVisible();
  expect(document.querySelector('[data-image-viewer-picture]')).toBeNull();
});

test('state passed to a viewer inside a group warns in development, since the group owns it', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  onTestFinished(() => warn.mockRestore());

  await render(<Gallery viewer={<Image.Viewer open loop />} />);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining('Pass them to Image.Group instead'));
  await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
});

test('with motion reduced the image fades in and out', async () => {
  await render(<Gallery />);
  await openAt('Second');
  const keyframes = currentBox()
    .getAnimations()
    .map((animation) => (animation.effect as KeyframeEffect).getKeyframes());
  expect(keyframes.at(-1)?.map((frame) => frame.opacity)).toEqual(['0', '1']);
});

test('with motion on the image grows out of its thumbnail and shrinks back into it', async (context) => {
  skipWithoutCdp(context);
  await motionOn();
  await render(<Gallery />);
  const thumbnail = document.querySelectorAll<HTMLElement>('[data-image]')[1]!;
  const from = thumbnail.getBoundingClientRect();

  await openAt('Second');
  const growing = currentBox()
    .getAnimations()
    .find((animation) => (animation.effect as KeyframeEffect).getKeyframes()[0]?.clipPath);
  expect(growing).toBeDefined();
  growing!.pause();
  growing!.currentTime = 0;
  const grown = centerOf(currentBox());
  expect(grown.x).toBeCloseTo(from.left + from.width / 2, 0);
  expect(grown.y).toBeCloseTo(from.top + from.height / 2, 0);
  growing!.finish();

  await userEvent.keyboard('{Escape}');
  const shrinking = currentBox()
    ?.getAnimations()
    .find((animation) => (animation.effect as KeyframeEffect).getTiming().fill === 'forwards');
  expect(shrinking).toBeDefined();
  for (const animation of document.getAnimations()) animation.finish();
  await expect.element(dialog()).not.toBeInTheDocument();
});

test('swiping the fitted image down closes the viewer', async (context) => {
  skipWithoutCdp(context);
  const onOpenChange = vi.fn();
  await render(<Gallery onOpenChange={onOpenChange} />);
  await openAt('Second');
  const start = centerOf(currentBox());

  await touch('touchStart', [start]);
  for (const down of [14, 60, 140, 220])
    await touch('touchMove', [{ x: start.x, y: start.y + down }]);
  await touch('touchEnd', []);
  await expect.element(dialog()).not.toBeInTheDocument();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

test('a sideways drag of the fitted image moves to the next image', async (context) => {
  skipWithoutCdp(context);
  await render(<Gallery />);
  await openAt('First');
  const start = centerOf(currentBox());

  await mouse('mousePressed', start);
  for (const across of [-60, -140, -220, -300])
    await mouse('mouseMoved', { x: start.x + across, y: start.y });
  await mouse('mouseReleased', { x: start.x - 300, y: start.y });
  await expect.poll(counter).toHaveTextContent('2 / 3');
});

test('a zoomed image pans under a drag and the track stays on it', async (context) => {
  skipWithoutCdp(context);
  await render(<Gallery />);
  await openAt('First');
  await userEvent.keyboard('+');
  await expect.poll(() => scaleOf(currentBox())).toBe(2);
  const start = centerOf(document.querySelector('[data-slide][data-selected]')!);

  await mouse('mousePressed', start);
  for (const across of [-40, -80, -160, -240])
    await mouse('mouseMoved', { x: start.x + across, y: start.y });
  await mouse('mouseReleased', { x: start.x - 240, y: start.y });
  await expect
    .poll(() => new DOMMatrixReadOnly(getComputedStyle(currentBox()).transform).e)
    .toBeLessThan(0);
  expect(counter()?.textContent).toBe('1 / 3');
});

test('two fingers zoom the image instead of moving the track', async (context) => {
  skipWithoutCdp(context);
  const onZoomChange = vi.fn();
  await render(<Gallery onZoomChange={onZoomChange} />);
  await openAt('Second');
  const center = centerOf(currentBox());

  await touch('touchStart', [{ x: center.x - 20, y: center.y }]);
  await touch('touchStart', [
    { x: center.x - 20, y: center.y },
    { x: center.x + 20, y: center.y },
  ]);
  await touch('touchMove', [
    { x: center.x - 60, y: center.y },
    { x: center.x + 60, y: center.y },
  ]);
  await touch('touchEnd', []);
  await expect.poll(() => onZoomChange.mock.lastCall?.[0]).toBeGreaterThan(2);
  expect(counter()?.textContent).toBe('2 / 3');
});
