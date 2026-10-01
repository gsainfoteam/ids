'use client';

import { MagnifyingGlassMinusIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageViewerZoomOutProps = ImageViewerButtonProps;

export function ImageViewerZoomOut(props: ImageViewerZoomOutProps) {
  const viewer = useImageViewerContext('Image.Viewer.ZoomOut');
  const t = useTranslate();

  return (
    <ViewerButton
      {...props}
      label={t('image.zoomOut')}
      glyph={<MagnifyingGlassMinusIcon aria-hidden="true" />}
      act={viewer.zoomOut}
      unavailable={!viewer.canZoomOut}
      quiet
    />
  );
}

ImageViewerZoomOut.displayName = 'Image.Viewer.ZoomOut';
