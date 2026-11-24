'use client';

import { useInternalImageViewerEmptyPress } from './use-image-viewer-empty-press';
import { useInternalImageViewerModal } from './use-image-viewer-modal';
import { useInternalImageViewerMotion } from './use-image-viewer-motion';
import {
  useInternalImageViewerSurfaces,
  type ImageViewerReport,
} from './use-image-viewer-surfaces';
import { useInternalImageViewerTransition } from './use-image-viewer-transition';

import type { ImageViewerContextValue } from '../context';
import type { ImageViewerSource } from '../parts/viewer';
import type { imageStyle } from '../style';

type SessionOptions = {
  source: ImageViewerSource;
  report: ImageViewerReport;
  styles: ReturnType<typeof imageStyle>;
};

export function useInternalImageViewerSession({ source, report, styles }: SessionOptions) {
  const { items } = source;
  const count = items.length;

  const surfaces = useInternalImageViewerSurfaces(report);
  const { content, backdrop, area, box, boxRef } = surfaces;

  const close = () => source.setOpen(false);

  const { slides, zoomPan, attachViewport, onKeyDown } = useInternalImageViewerMotion({
    source,
    content,
    backdrop,
    area,
    box,
    close,
  });
  const { layer, stacked } = useInternalImageViewerModal({ source, content, close });
  useInternalImageViewerTransition({ source, content, boxRef, selected: slides.selected, layer });
  const { notePress, closeOnAnEmptyPress } = useInternalImageViewerEmptyPress(close);

  const current = slides.selected;
  const context: ImageViewerContextValue = {
    items,
    index: current,
    count,
    item: items[current],
    canPrev: slides.canScrollPrev,
    canNext: slides.canScrollNext,
    prev: () => slides.scrollPrev(),
    next: () => slides.scrollNext(),
    goTo: (index) => slides.scrollTo(index),
    canZoomIn: box !== null && zoomPan.canZoomIn,
    canZoomOut: box !== null && zoomPan.canZoomOut,
    zoomIn: zoomPan.zoomIn,
    zoomOut: zoomPan.zoomOut,
    zoom: zoomPan.scale,
    canResetZoom: box !== null && zoomPan.canZoomOut,
    resetZoom: zoomPan.reset,
    close,
    styles,
  };

  return {
    ...surfaces,
    attachViewport,
    slides,
    zoomPan,
    layer,
    stacked,
    current,
    context,
    close,
    onKeyDown,
    notePress,
    closeOnAnEmptyPress,
  };
}
