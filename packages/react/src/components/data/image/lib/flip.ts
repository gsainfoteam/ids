import { cornerExponent, insetClipPath } from '../../../../internal/lib/corner-shape';
import { motionDuration, prefersReducedMotion, SHEET_EASING } from '../../../../internal/lib/motion';

type Box = { x: number; y: number; width: number; height: number };

const ARRIVING_FROM_NOWHERE = 'scale(0.96)';
const FADE_EASING = 'ease-out';
const LEAVE_AS_IT_ENDS = { fill: 'forwards' } as const;

const centerOf = (rect: DOMRectReadOnly) => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

function layoutBox(element: HTMLElement): Box {
  const center = centerOf(element.getBoundingClientRect());
  const moved = new DOMMatrixReadOnly(getComputedStyle(element).transform);

  return {
    x: center.x - moved.e,
    y: center.y - moved.f,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}

const onScreen = (rect: DOMRectReadOnly, view: Window) =>
  rect.width > 0 &&
  rect.height > 0 &&
  rect.right > 0 &&
  rect.bottom > 0 &&
  rect.left < view.innerWidth &&
  rect.top < view.innerHeight;

const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

type ThumbnailFrames = { thumbnail: Keyframe; unclipped: string };

function thumbnailFrames(element: HTMLElement, origin: Element | null): ThumbnailFrames | null {
  const view = element.ownerDocument.defaultView;
  if (!origin || !view) return null;

  const from = origin.getBoundingClientRect();
  const box = layoutBox(element);
  if (!onScreen(from, view) || box.width === 0 || box.height === 0) return null;

  const center = centerOf(from);
  const cover = Math.max(from.width / box.width, from.height / box.height);
  const insetX = (box.width - from.width / cover) / 2;
  const insetY = (box.height - from.height / cover) / 2;
  const originStyle = getComputedStyle(origin);
  const radius = Number.parseFloat(originStyle.borderTopLeftRadius) || 0;
  const exponent = cornerExponent(originStyle, 'top-left');
  const insets = { top: insetY, right: insetX, bottom: insetY, left: insetX };

  return {
    thumbnail: {
      transform: `translate(${center.x - box.x}px, ${center.y - box.y}px) scale(${cover})`,
      clipPath: insetClipPath(box, insets, radius / cover, exponent),
    },
    unclipped: insetClipPath(box, NO_INSETS, 0, exponent),
  };
}

const shrunkFrom = (transform: string) =>
  transform === 'none' ? ARRIVING_FROM_NOWHERE : `${transform} ${ARRIVING_FROM_NOWHERE}`;

const fadeTiming = (element: HTMLElement): KeyframeAnimationOptions => ({
  duration: motionDuration(element, 'fast'),
  easing: FADE_EASING,
});

const moveTiming = (element: HTMLElement): KeyframeAnimationOptions => ({
  duration: motionDuration(element, 'slow'),
  easing: SHEET_EASING,
});

export function enterFrom(element: HTMLElement, origin: Element | null): Animation {
  if (prefersReducedMotion(element))
    return element.animate([{ opacity: 0 }, { opacity: 1 }], fadeTiming(element));

  const rest = element.style.transform || 'none';
  const frames = thumbnailFrames(element, origin);

  if (!frames)
    return element.animate(
      [
        { opacity: 0, transform: shrunkFrom(rest) },
        { opacity: 1, transform: rest },
      ],
      moveTiming(element),
    );

  return element.animate(
    [frames.thumbnail, { transform: rest, clipPath: frames.unclipped }],
    moveTiming(element),
  );
}

export function exitTo(element: HTMLElement, origin: Element | null): Animation {
  if (prefersReducedMotion(element))
    return element.animate([{ opacity: 1 }, { opacity: 0 }], {
      ...fadeTiming(element),
      ...LEAVE_AS_IT_ENDS,
    });

  const now = getComputedStyle(element).transform;
  const frames = thumbnailFrames(element, origin);

  if (!frames)
    return element.animate(
      [
        { opacity: 1, transform: now },
        { opacity: 0, transform: shrunkFrom(now) },
      ],
      { ...moveTiming(element), ...LEAVE_AS_IT_ENDS },
    );

  return element.animate([{ transform: now, clipPath: frames.unclipped }, frames.thumbnail], {
    ...moveTiming(element),
    ...LEAVE_AS_IT_ENDS,
  });
}
