'use client';

import { useInternalImageGroup } from './use-image-group';
import { useInternalOverlayItem } from '../../../../internal/overlay';
import { nothingFromThePage, standaloneItem } from '../lib/viewer-source';

import type { ImageViewerProps, ImageViewerSource } from '../parts/viewer';

export function useInternalImageViewerStandaloneSource(props: ImageViewerProps): ImageViewerSource {
  const { items = [], open, onOpenChange } = props;
  const item = useInternalOverlayItem(open);
  const state = useInternalImageGroup(props);

  const setOpen = (next: boolean) => {
    if (!item) {
      state.setOpen(next);
      return;
    }

    if (next === item.open) return;
    onOpenChange?.(next);
    if (!next) item.close(undefined);
  };

  return {
    items: items.map(standaloneItem),
    thumbnailOf: nothingFromThePage,
    opener: null,
    value: state.value,
    setValue: state.setValue,
    open: item ? item.open : state.open,
    setOpen,
    zoom: state.zoom,
    setZoom: state.setZoom,
    loop: state.loop,
    onExitComplete: item?.exited,
  };
}
