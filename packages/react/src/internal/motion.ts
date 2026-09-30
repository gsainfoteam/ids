export type MotionToken = 'fast' | 'normal' | 'slow';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const DURATION_WITHOUT_THE_TOKEN: Record<MotionToken, number> = {
  fast: 150,
  normal: 250,
  slow: 400,
};

const MS_PER_SECOND = 1000;

export const SHEET_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';

export function prefersReducedMotion(element: Element) {
  const view = element.ownerDocument.defaultView;
  return typeof view?.matchMedia === 'function' && view.matchMedia(REDUCED_MOTION).matches;
}

export function motionDuration(element: Element, token: MotionToken) {
  const value = getComputedStyle(element).getPropertyValue(`--ids-motion-${token}`).trim();
  const amount = Number.parseFloat(value);

  if (!Number.isFinite(amount)) return DURATION_WITHOUT_THE_TOKEN[token];
  if (value.endsWith('ms')) return amount;
  return value.endsWith('s') ? amount * MS_PER_SECOND : amount;
}
