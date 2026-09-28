import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

import {
  arrow as arrowPosition,
  autoUpdate,
  flip,
  limitShift,
  offset,
  shift,
  size,
  useFloating,
  type OpenChangeReason,
  type Placement,
  type UseFloatingReturn,
} from '@floating-ui/react';
import { clamp } from 'es-toolkit';

import { isNodeFromAnyWindow } from '../../utils';

export type AnchoredSide = 'top' | 'right' | 'bottom' | 'left';
export type AnchoredAlign = 'start' | 'center' | 'end';

export const VIEWPORT_MARGIN = 8;
const MIN_HEIGHT = 120;

const OPPOSITE: Record<AnchoredSide, AnchoredSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const placementOf = (side: AnchoredSide, align: AnchoredAlign): Placement =>
  align === 'center' ? side : `${side}-${align}`;
const sideOf = (placement: Placement) => placement.split('-')[0] as AnchoredSide;
const alignOf = (placement: Placement) =>
  (placement.split('-')[1] as AnchoredAlign | undefined) ?? 'center';

export type UseAnchoredOptions = {
  open: boolean;
  onOpenChange?: (open: boolean, event?: Event, reason?: OpenChangeReason) => void;
  reference: Element | RefObject<Element | null> | null;
  floating: HTMLElement | null;
  positioned?: boolean;
  side?: AnchoredSide;
  align?: AnchoredAlign;
  sideOffset?: number;
  alignOffset?: number;
  width?: 'anchor' | number;
  maxHeight?: number;
  arrow?: HTMLElement | null;
  arrowPadding?: number;
  nodeId?: string;
};

export type Anchored = {
  context: UseFloatingReturn['context'];
  refs: UseFloatingReturn['refs'];
  floatingStyles: CSSProperties;
  middlewareData: UseFloatingReturn['middlewareData'];
  side: AnchoredSide;
  align: AnchoredAlign;
  isPositioned: boolean;
  update: () => void;
};

export function useAnchored({
  open,
  onOpenChange,
  reference,
  floating,
  positioned = true,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  width,
  maxHeight,
  arrow,
  arrowPadding = 8,
  nodeId,
}: UseAnchoredOptions): Anchored {
  const preferred = placementOf(side, align);
  const [landed, setLanded] = useState<Placement>(preferred);
  const [landedFor, setLandedFor] = useState({ preferred, open });
  if (landedFor.preferred !== preferred || landedFor.open !== open) {
    setLandedFor({ preferred, open });
    setLanded(preferred);
  }

  useLayoutEffect(() => {
    if (!floating || !positioned) return;
    const undoPopoverUaInset = { right: 'auto', bottom: 'auto' };
    Object.assign(floating.style, undoPopoverUaInset);
    const capHeightBeforeFirstFlip = maxHeight;
    if (capHeightBeforeFirstFlip !== undefined)
      floating.style.setProperty('max-height', `${capHeightBeforeFirstFlip}px`);
  }, [floating, positioned, maxHeight]);

  const referenceElement = isNodeFromAnyWindow(reference) ? (reference as Element) : null;
  const referenceRef =
    reference && !referenceElement ? (reference as RefObject<Element | null>) : null;

  const floatingState = useFloating({
    open,
    onOpenChange,
    nodeId,
    elements: { reference: positioned ? referenceElement : null, floating },
    strategy: 'fixed',
    placement: landed,
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }),
      flip({
        padding: VIEWPORT_MARGIN,
        crossAxis: false,
        fallbackPlacements: [placementOf(OPPOSITE[sideOf(landed)], alignOf(landed))],
      }),
      size({
        padding: VIEWPORT_MARGIN,
        apply({ availableWidth, availableHeight, rects, elements }) {
          const node = elements.floating;
          const doc = node.ownerDocument;
          const anchorWidth = rects.reference.width;
          node.style.setProperty('--anchor-width', `${anchorWidth}px`);
          node.style.setProperty('--anchor-height', `${rects.reference.height}px`);
          node.style.setProperty('--available-width', `${Math.max(0, availableWidth)}px`);
          node.style.setProperty('--available-height', `${Math.max(0, availableHeight)}px`);
          if (width !== undefined) {
            const viewport = doc.documentElement.clientWidth || doc.defaultView!.innerWidth;
            const wanted = width === 'anchor' ? anchorWidth : Math.max(anchorWidth, width);
            node.style.width = `${Math.min(wanted, viewport - VIEWPORT_MARGIN * 2)}px`;
          }
          if (maxHeight !== undefined) {
            const floor = Math.min(MIN_HEIGHT, maxHeight);
            node.style.maxHeight = `${clamp(availableHeight, floor, maxHeight)}px`;
          }
        },
      }),
      shift({ padding: VIEWPORT_MARGIN, crossAxis: true, limiter: limitShift() }),
      arrow ? arrowPosition({ element: arrow, padding: arrowPadding }) : null,
    ],
  });

  const { setReference } = floatingState.refs;
  useLayoutEffect(() => {
    if (referenceRef) setReference(positioned ? referenceRef.current : null);
  }, [referenceRef, positioned, setReference]);

  const { placement, isPositioned } = floatingState;
  if (isPositioned && placement !== landed && landedFor.open === open) setLanded(placement);

  return {
    context: floatingState.context,
    refs: floatingState.refs,
    floatingStyles: floatingState.floatingStyles,
    middlewareData: floatingState.middlewareData,
    side: sideOf(placement),
    align: alignOf(placement),
    isPositioned,
    update: floatingState.update,
  };
}
