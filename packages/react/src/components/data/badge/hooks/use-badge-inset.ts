'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

import { cornerRadii, diagonalInset } from '../../../../internal/lib/corner-geometry';
import { cornerExponent, type PhysicalCorner } from '../../../../internal/lib/corner-shape';

import type { BadgePlacement } from '../root';

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

function placeOn(root: HTMLElement, wrapped: Element, placement: BadgePlacement) {
  const inset = insetOnTheCurve(root, wrapped, placement);
  root.style.setProperty(INSET_X, `${inset.x}px`);
  root.style.setProperty(INSET_Y, `${inset.y}px`);
}

function clearInset(root: HTMLElement) {
  root.style.removeProperty(INSET_X);
  root.style.removeProperty(INSET_Y);
}

type Watch = { root: HTMLElement; wrapped: Element; observer: ResizeObserver };

export function useInternalBadgeInset(
  rootRef: RefObject<HTMLElement | null>,
  placement: BadgePlacement,
) {
  const watch = useRef<Watch | null>(null);
  const currentPlacement = useRef(placement);

  useLayoutEffect(() => {
    currentPlacement.current = placement;
    const root = rootRef.current;
    const wrapped = root && wrappedElementOf(root);

    if (watch.current && watch.current.wrapped !== wrapped) {
      watch.current.observer.disconnect();
      watch.current = null;
    }

    if (!root || !wrapped) {
      if (root) clearInset(root);
      return;
    }

    if (!watch.current) {
      const observer = new ResizeObserver(() => placeOn(root, wrapped, currentPlacement.current));
      observer.observe(wrapped);
      watch.current = { root, wrapped, observer };
    }

    placeOn(root, wrapped, placement);
  });

  useLayoutEffect(
    () => () => {
      if (!watch.current) return;
      watch.current.observer.disconnect();
      clearInset(watch.current.root);
      watch.current = null;
    },
    [],
  );
}
