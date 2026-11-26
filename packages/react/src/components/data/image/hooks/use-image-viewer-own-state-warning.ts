'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

import type { ImageViewerProps } from '../parts/viewer';

export function useInternalImageViewerOwnStateWarning(props: ImageViewerProps) {
  const ownState = [
    props.items,
    props.open,
    props.defaultOpen,
    props.onOpenChange,
    props.value,
    props.defaultValue,
    props.onValueChange,
    props.loop,
    props.zoom,
    props.defaultZoom,
    props.onZoomChange,
  ].some((prop) => prop !== undefined);

  useEffect(() => {
    if (isDevelopment && ownState)
      console.warn(
        '[IDS] Image.Viewer: inside ImageGroup the group owns the images, open, value, loop and zoom. Pass them to ImageGroup instead.',
      );
  }, [ownState]);
}
