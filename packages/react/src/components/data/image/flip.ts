import { motionDuration, prefersReducedMotion, SHEET_EASING } from '../../../internal/motion';

type Box = { x: number; y: number; width: number; height: number };

const UNCLIPPED = 'inset(0px 0px round 0px)';
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

function thumbnailFrame(element: HTMLElement, origin: Element | null): Keyframe | null {
  const view = element.ownerDocument.defaultView;
  if (!origin || !view) return null;

  const from = origin.getBoundingClientRect();
  const box = layoutBox(element);
  if (!onScreen(from, view) || box.width === 0 || box.height === 0) return null;

  const center = centerOf(from);
  const cover = Math.max(from.width / box.width, from.height / box.height);
  const insetX = (box.width - from.width / cover) / 2;
  const insetY = (box.height - from.height / cover) / 2;
  const radius = Number.parseFloat(getComputedStyle(origin).borderTopLeftRadius) || 0;

  return {
    transform: `translate(${center.x - box.x}px, ${center.y - box.y}px) scale(${cover})`,
    clipPath: `inset(${insetY}px ${insetX}px round ${radius / cover}px)`,
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
  const thumbnail = thumbnailFrame(element, origin);

  if (!thumbnail)
    return element.animate(
      [
        { opacity: 0, transform: shrunkFrom(rest) },
        { opacity: 1, transform: rest },
      ],
      moveTiming(element),
    );

  return element.animate(
    [thumbnail, { transform: rest, clipPath: UNCLIPPED }],
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
  const thumbnail = thumbnailFrame(element, origin);

  if (!thumbnail)
    return element.animate(
      [
        { opacity: 1, transform: now },
        { opacity: 0, transform: shrunkFrom(now) },
      ],
      { ...moveTiming(element), ...LEAVE_AS_IT_ENDS },
    );

  return element.animate([{ transform: now, clipPath: UNCLIPPED }, thumbnail], {
    ...moveTiming(element),
    ...LEAVE_AS_IT_ENDS,
  });
}
