'use client';

import { useCallback, type KeyboardEvent, type RefCallback } from 'react';

import { keyHandler } from '../../../../internal/lib/keys';
import { useInternalSlides } from '../../../../internal/slides';
import { useInternalZoomPan } from '../../../../internal/zoom-pan';

import type { ImageViewerSource } from '../parts/viewer';

type MotionOptions = {
  source: ImageViewerSource;
  content: HTMLElement | null;
  backdrop: HTMLElement | null;
  area: HTMLElement | null;
  box: HTMLElement | null;
  close: () => void;
};

const FITTED = 1;
const PRESENCE = '--image-viewer-presence';
const SWIPING = 'data-swiping';

export function useInternalImageViewerMotion({
  source,
  content,
  backdrop,
  area,
  box,
  close,
}: MotionOptions) {
  const count = source.items.length;

  const slides = useInternalSlides({
    slideCount: count,
    value: source.value,
    onValueChange: (index) => {
      source.setValue(index);
      source.setZoom(FITTED);
    },
    loop: source.loop,
    watchDrag: () => !zoomPan.isZoomed(),
  });

  const surfaces = [content, backdrop];
  const { viewportRef } = slides;
  const attachViewport: RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => viewportRef(node),
    [viewportRef],
  );

  const paintSwipe = (presence: number, dragging: boolean) => {
    for (const surface of surfaces) {
      surface?.style.setProperty(PRESENCE, String(presence));
      surface?.toggleAttribute(SWIPING, dragging);
    }
    if (dragging) slides.cancelDrag();
  };

  const zoomPan = useInternalZoomPan({
    element: area,
    content: box,
    scale: source.zoom,
    onScaleChange: source.setZoom,
    onSwipe: paintSwipe,
    onSwipeClose: () => {
      for (const surface of surfaces) surface?.removeAttribute(SWIPING);
      close();
    },
    onPinchStart: () => slides.cancelDrag(),
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (zoomPan.onKeyDown(event)) return;

    keyHandler<HTMLDivElement>(
      {
        ArrowLeft: () => slides.scrollPrev(),
        ArrowRight: () => slides.scrollNext(),
        Home: () => slides.scrollTo(0),
        End: () => slides.scrollTo(count - 1),
      },
      { dir: slides.direction },
    )(event);
  };

  return { slides, zoomPan, attachViewport, onKeyDown };
}
