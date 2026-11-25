export function isRtl(element: HTMLElement) {
  const direction = element.ownerDocument.defaultView?.getComputedStyle(element).direction;
  if (direction) return direction === 'rtl';
  return element.closest('[dir]')?.getAttribute('dir') === 'rtl';
}
