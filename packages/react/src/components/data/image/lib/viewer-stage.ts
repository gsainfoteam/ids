const WHAT_IS_NOT_EMPTY = '[data-image-viewer-box], [data-image-viewer-notice]';
const THE_STAGE = '[data-image-viewer-stage]';

export function isEmptyGround(target: Element, viewer: Element) {
  if (target === viewer) return true;
  return target.closest(THE_STAGE) !== null && target.closest(WHAT_IS_NOT_EMPTY) === null;
}

export function isNear(index: number, current: number, count: number, loop: boolean) {
  const apart = Math.abs(index - current);
  return apart <= 1 || (loop && count - apart <= 1);
}
