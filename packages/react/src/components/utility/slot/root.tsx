'use client';

import { cloneElement, Fragment, isValidElement } from 'react';

import { invariant, mergeProps } from '../../../utils';

import type { Slot } from '.';

export function SlotRoot({ children, ...slotProps }: Slot.Props) {
  invariant(isValidElement(children), '`<Slot>` requires exactly one React element as its child.');
  invariant(
    children.type !== Fragment,
    '`<Slot>` cannot target a Fragment - cloneElement would set the merged props on the Fragment, not on a host element. Render the element directly.',
  );

  return cloneElement(children, mergeProps(children.props as Record<string, unknown>, slotProps));
}
