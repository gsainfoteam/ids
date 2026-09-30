import type { ResizeDimension } from './axis';

export type MeasuredAxis = { size: number; min: number; max: number };

const BEING_DRAGGED = new WeakSet<Element>();

const pixels = (value: string, otherwise: number) =>
  value.endsWith('px') ? parseFloat(value) : otherwise;

const styleOf = (element: Element) => element.ownerDocument.defaultView!.getComputedStyle(element);

function paddingAndBorder(style: CSSStyleDeclaration, dimension: ResizeDimension) {
  if (style.boxSizing === 'border-box') return 0;
  const sides =
    dimension === 'width'
      ? [style.paddingLeft, style.paddingRight, style.borderLeftWidth, style.borderRightWidth]
      : [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth];
  return sides.reduce((sum, side) => sum + (parseFloat(side) || 0), 0);
}

export function measureAxis(element: HTMLElement, dimension: ResizeDimension): MeasuredAxis {
  const style = styleOf(element);
  const drawn = dimension === 'width' ? element.offsetWidth : element.offsetHeight;
  const [min, max] =
    dimension === 'width' ? [style.minWidth, style.maxWidth] : [style.minHeight, style.maxHeight];

  return {
    size: drawn - paddingAndBorder(style, dimension),
    min: pixels(min, 0),
    max: pixels(max, Infinity),
  };
}

export const isRightToLeft = (element: Element) => styleOf(element).direction === 'rtl';

export function markDragged(elements: readonly Element[], dragged: boolean) {
  for (const element of elements)
    if (dragged) BEING_DRAGGED.add(element);
    else BEING_DRAGGED.delete(element);
}

export const isBeingDragged = (element: Element) => BEING_DRAGGED.has(element);

const HELD_PROPERTIES = ['cursor', 'user-select', '-webkit-user-select'] as const;

export function holdResizeCursor(doc: Document, cursor: string) {
  const root = doc.documentElement;
  const hadStyle = root.hasAttribute('style');
  const before = HELD_PROPERTIES.map((name) => root.style.getPropertyValue(name));

  root.style.setProperty('cursor', cursor);
  root.style.setProperty('user-select', 'none');
  root.style.setProperty('-webkit-user-select', 'none');

  return () => {
    HELD_PROPERTIES.forEach((name, index) => root.style.setProperty(name, before[index]!));
    if (!hadStyle && root.style.length === 0) root.removeAttribute('style');
  };
}
