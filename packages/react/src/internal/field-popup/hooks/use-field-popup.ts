'use client';

import { useState, type RefObject } from 'react';

import { useInternalFieldPopupInitialFocus } from './use-field-popup-initial-focus';
import { useInternalFieldPopupPlacement } from './use-field-popup-placement';
import {
  useInternalAnchored,
  useInternalDrawerPresentation,
  useInternalLayer,
  type PopupPresentation,
} from '../../overlay';

export type PopupSide = 'top' | 'bottom';
export type PopupAlign = 'start' | 'end';

export type UseFieldPopupOptions = {
  anchor: RefObject<HTMLElement | null>;
  onClose: (restoreFocus: boolean) => void;
  mobileVariant: PopupPresentation;
  preferredWidth: number;
  matchWidth: boolean;
  side: PopupSide;
  align: PopupAlign;
  offset: number;
  maxHeight: number;
  initialFocusSelector: string | undefined;
};

export function useInternalFieldPopup({
  anchor,
  onClose,
  mobileVariant,
  preferredWidth,
  matchWidth,
  side,
  align,
  offset,
  maxHeight,
  initialFocusSelector,
}: UseFieldPopupOptions) {
  const [popup, setPopup] = useState<HTMLElement | null>(null);
  const drawer = useInternalDrawerPresentation(mobileVariant);
  const presentation: PopupPresentation = drawer ? 'drawer' : 'popover';
  const [titleId, setTitleId] = useState<string>();
  const [stacked, setStacked] = useState(false);

  const layer = useInternalLayer(true, {
    kind: drawer ? 'modal' : 'popup',
    element: () => popup,
    anchor: () => anchor.current,
    onDismiss: (reason) => onClose(reason === 'escape-key'),
    onPositionChange: ({ modalsBelow }) => setStacked(modalsBelow > 0),
  });

  const anchored = useInternalAnchored({
    open: true,
    reference: anchor,
    floating: popup,
    positioned: !drawer,
    side,
    align,
    sideOffset: offset,
    width: matchWidth ? 'anchor' : preferredWidth,
    maxHeight,
  });

  useInternalFieldPopupPlacement(popup, drawer, anchored.isPositioned);
  useInternalFieldPopupInitialFocus(popup, drawer, initialFocusSelector);

  return { popup, setPopup, drawer, presentation, layer, anchored, titleId, setTitleId, stacked };
}
