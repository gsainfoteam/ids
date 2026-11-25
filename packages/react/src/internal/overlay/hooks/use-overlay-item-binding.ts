'use client';

import { useLayoutEffect, useMemo } from 'react';

import { type OverlayItemBinding } from '../context';
import {
  bindLayer,
  overlay,
  removeClosed,
  removeIfNothingExits,
  type OverlayItem,
} from '../lib/store';

export function useInternalOverlayItemBinding(item: OverlayItem) {
  useLayoutEffect(() => {
    if (!item.open) removeIfNothingExits(item.id);
  }, [item.open, item.id]);

  return useMemo<OverlayItemBinding>(
    () => ({
      open: item.open,
      close: (value) => overlay.close(item.id, value),
      exited: () => removeClosed(item.id),
      bind: () => bindLayer(item.id),
    }),
    [item.open, item.id],
  );
}
