import { type CSSProperties } from 'react';

import { expect, onTestFinished, test } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { skipWithoutCdp } from './engines';
import { enterFrom, exitTo } from '../src/components/data/image/flip';

const THUMBNAIL: CSSProperties = {
  position: 'fixed',
  left: 20,
  top: 30,
  width: 60,
  height: 60,
  borderRadius: 10,
};
const VIEWED: CSSProperties = { position: 'fixed', left: 100, top: 200, width: 200, height: 100 };

const COVER = 0.6;
const CROPPED_SIDE = 50;
const TO_THE_THUMBNAIL = { x: 50 - 200, y: 60 - 250 };

async function stage(thumbnail: CSSProperties = THUMBNAIL, viewed: CSSProperties = VIEWED) {
  const screen = await render(
    <>
      <div data-testid="thumbnail" style={thumbnail} />
      <div data-testid="viewed" style={viewed} />
    </>,
  );
  return {
    thumbnail: screen.getByTestId('thumbnail').element() as HTMLElement,
    viewed: screen.getByTestId('viewed').element() as HTMLElement,
  };
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

const keyframesOf = (animation: Animation) => (animation.effect as KeyframeEffect).getKeyframes();

const timingOf = (animation: Animation) => (animation.effect as KeyframeEffect).getTiming();

const numbersIn = (value: unknown) => [...String(value).matchAll(/-?[\d.]+/g)].map(Number);

const center = (rect: DOMRect) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

test('with motion reduced the image only fades in and out, and stays faded until removed', async () => {
  const { thumbnail, viewed } = await stage();

  const entering = enterFrom(viewed, thumbnail);
  expect(keyframesOf(entering).map((frame) => frame.opacity)).toEqual(['0', '1']);
  expect(keyframesOf(entering).some((frame) => 'transform' in frame)).toBe(false);
  expect(timingOf(entering).duration, '--ids-motion-fast').toBe(150);
  entering.finish();

  const leaving = exitTo(viewed, thumbnail);
  expect(keyframesOf(leaving).map((frame) => frame.opacity)).toEqual(['1', '0']);
  expect(timingOf(leaving).fill).toBe('forwards');
  leaving.finish();
  expect(getComputedStyle(viewed).opacity).toBe('0');
});

test('with motion on the image grows out of the thumbnail, cropped to its box and corner', async (context) => {
  skipWithoutCdp(context);
  await motionOn();
  const { thumbnail, viewed } = await stage();

  const entering = enterFrom(viewed, thumbnail);
  const [first, last] = keyframesOf(entering);
  expect(timingOf(entering).duration, '--ids-motion-slow').toBe(400);
  expect(numbersIn(first!.transform)).toEqual([TO_THE_THUMBNAIL.x, TO_THE_THUMBNAIL.y, COVER]);
  const [top, side, radius] = numbersIn(first!.clipPath);
  expect(top).toBeCloseTo(0);
  expect(side).toBeCloseTo(CROPPED_SIDE);
  expect(radius, 'the thumbnail corner, before scaling').toBeCloseTo(10 / COVER);
  expect(last!.transform).toBe('none');
  expect(String(last!.clipPath)).toMatch(/^inset\(/);
  expect(numbersIn(last!.clipPath).every((value) => value === 0)).toBe(true);

  entering.pause();
  entering.currentTime = 0;
  const grown = viewed.getBoundingClientRect();
  expect(center(grown).x).toBeCloseTo(50, 0);
  expect(center(grown).y).toBeCloseTo(60, 0);
  expect(grown.width * ((200 - 2 * CROPPED_SIDE) / 200), 'the visible width').toBeCloseTo(60, 0);
  expect(grown.height).toBeCloseTo(60, 0);
  entering.finish();
  expect(viewed.getBoundingClientRect().width).toBeCloseTo(200, 0);
});

test('with motion on a zoomed image shrinks back from where it is into the thumbnail', async (context) => {
  skipWithoutCdp(context);
  await motionOn();
  const { thumbnail, viewed } = await stage();
  viewed.style.transform = 'translate3d(20px, 10px, 0) scale(2)';

  const leaving = exitTo(viewed, thumbnail);
  const [first, last] = keyframesOf(leaving);
  expect(numbersIn(first!.transform)).toEqual([2, 0, 0, 2, 20, 10]);
  expect(numbersIn(last!.transform), 'measured from the box, not the zoom').toEqual([
    TO_THE_THUMBNAIL.x,
    TO_THE_THUMBNAIL.y,
    COVER,
  ]);
  expect(timingOf(leaving).fill).toBe('forwards');
  leaving.finish();
  expect(center(viewed.getBoundingClientRect()).x).toBeCloseTo(50, 0);
});

test('with motion on and no thumbnail on screen, the image fades and settles from slightly smaller', async (context) => {
  skipWithoutCdp(context);
  await motionOn();
  const { thumbnail, viewed } = await stage({ ...THUMBNAIL, top: -500 });

  for (const origin of [null, thumbnail]) {
    const entering = enterFrom(viewed, origin);
    expect(keyframesOf(entering).map((frame) => [frame.opacity, frame.transform])).toEqual([
      ['0', 'scale(0.96)'],
      ['1', 'none'],
    ]);
    entering.finish();

    const leaving = exitTo(viewed, origin);
    expect(keyframesOf(leaving).map((frame) => frame.opacity)).toEqual(['1', '0']);
    leaving.cancel();
  }
});

test('with motion on, an image that has no size yet enters without the thumbnail', async (context) => {
  skipWithoutCdp(context);
  await motionOn();
  const { thumbnail, viewed } = await stage(THUMBNAIL, { ...VIEWED, width: 0 });

  const entering = enterFrom(viewed, thumbnail);
  expect(keyframesOf(entering)[0]!.transform).toBe('scale(0.96)');
  entering.cancel();
});
