'use client';

import { useLayoutEffect } from 'react';

import { onViewportChange, raiseWhatStaysAboveLayers, showInTopLayer } from '../../overlay';
import { onPlacementLanded } from '../lib/reveal';
import { placeSheet } from '../lib/sheet';

export function useInternalFieldPopupPlacement(
  popup: HTMLElement | null,
  drawer: boolean,
  isPositioned: boolean,
) {
  useLayoutEffect(() => {
    if (!popup || drawer) return;

    showInTopLayer(popup);
    raiseWhatStaysAboveLayers();
  }, [popup, drawer]);

  useLayoutEffect(() => {
    if (popup && !drawer && isPositioned) onPlacementLanded(popup);
  }, [popup, drawer, isPositioned]);

  useLayoutEffect(() => {
    if (!popup || !drawer) return;

    const win = popup.ownerDocument.defaultView!;
    const place = () => {
      placeSheet(popup, win);
      onPlacementLanded(popup);
    };

    place();
    return onViewportChange(win, place);
  }, [popup, drawer]);
}
