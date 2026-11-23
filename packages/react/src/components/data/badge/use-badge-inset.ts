'use client';

import { useLayoutEffect, type ReactNode, type RefObject } from 'react';

import { cornerRadii, diagonalInset } from '../../../internal/corner-geometry';
import { cornerExponent, type PhysicalCorner } from '../../../internal/corner-shape';

import type { BadgePlacement } from './root';

const CORNER_OF_PLACEMENT: Record<BadgePlacement, { ltr: PhysicalCorner; rtl: PhysicalCorner }> = {
  'top-end': { ltr: 'top-right', rtl: 'top-left' },
  'top-start': { ltr: 'top-left', rtl: 'top-right' },
  'bottom-end': { ltr: 'bottom-right', rtl: 'bottom-left' },
  'bottom-start': { ltr: 'bottom-left', rtl: 'bottom-right' },
};

const INSET_X = '--badge-inset-x';
const INSET_Y = '--badge-inset-y';

function sizeOf(element: Element) {
  if (element instanceof element.ownerDocument.defaultView!.HTMLElement)
    return { width: element.offsetWidth, height: element.offsetHeight };

  return element.getBoundingClientRect();
}

function wrappedElementOf(root: HTMLElement) {
  const first = root.firstElementChild;
  return first && !first.hasAttribute('data-badge-indicator') ? first : null;
}

export function insetOnTheCurve(root: HTMLElement, wrapped: Element, placement: BadgePlacement) {
  const win = root.ownerDocument.defaultView!;
  const rtl = win.getComputedStyle(root).direction === 'rtl';
  const corner = CORNER_OF_PLACEMENT[placement][rtl ? 'rtl' : 'ltr'];
  const style = win.getComputedStyle(wrapped);
  const { width, height } = sizeOf(wrapped);
  const radius = cornerRadii(style, width, height)[corner];
  const exponent = cornerExponent(style, corner);

  return { x: diagonalInset(radius.x, exponent), y: diagonalInset(radius.y, exponent) };
}

export function useBadgeInset(
  rootRef: RefObject<HTMLElement | null>,
  placement: BadgePlacement,
  anchor: ReactNode,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const wrapped = root && wrappedElementOf(root);
    if (!root || !wrapped) return;

    const place = () => {
      const inset = insetOnTheCurve(root, wrapped, placement);
      root.style.setProperty(INSET_X, `${inset.x}px`);
      root.style.setProperty(INSET_Y, `${inset.y}px`);
    };
    const resize = new ResizeObserver(place);
    resize.observe(wrapped);
    place();

    return () => {
      resize.disconnect();
      root.style.removeProperty(INSET_X);
      root.style.removeProperty(INSET_Y);
    };
  }, [rootRef, placement, anchor]);
}
