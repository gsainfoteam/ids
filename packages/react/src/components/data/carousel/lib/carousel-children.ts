import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';

import { elementTypeOf } from '../../../../utils';

import type { SlidesDragEvent } from '../../../../internal/slides';

export type CarouselHolder = ReactElement<{ children?: ReactNode; asChild?: boolean }>;

export function findElementOfType(
  children: unknown,
  types: ReadonlySet<unknown>,
): CarouselHolder | undefined {
  if (typeof children === 'function') return undefined;

  for (const child of Children.toArray(children as ReactNode)) {
    if (!isValidElement<{ children?: ReactNode }>(child)) continue;
    if (types.has(elementTypeOf(child))) return child as CarouselHolder;
    const nested = findElementOfType(child.props.children, types);
    if (nested) return nested;
  }
  return undefined;
}

export const startsFromAStep = (_api: unknown, event: SlidesDragEvent) =>
  !(event.target as Element | null)?.closest?.('[data-carousel-step]');
