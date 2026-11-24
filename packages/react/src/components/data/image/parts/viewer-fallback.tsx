'use client';

import { type ComponentProps } from 'react';

export type ImageViewerFallbackProps = ComponentProps<'span'>;

export function ImageViewerFallback(props: ImageViewerFallbackProps) {
  return <span {...props} data-image-viewer-fallback="" />;
}

ImageViewerFallback.displayName = 'Image.Viewer.Fallback';
