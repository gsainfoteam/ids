'use client';

import { MagnifyingGlassMinusIcon } from '@heroicons/react/16/solid';

import { useInternalImageViewerContext } from '../context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type ImageViewerZoomOutProps = ImageViewerButtonProps;

export function ImageViewerZoomOut(props: ImageViewerZoomOutProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.ZoomOut');
  const t = useInternalTranslate();

  return (
    <ViewerButton
      {...props}
      label={t('image.zoomOut')}
      glyph={<MagnifyingGlassMinusIcon aria-hidden="true" />}
      act={viewer.zoomOut}
      unavailable={!viewer.canZoomOut}
    />
  );
}

ImageViewerZoomOut.displayName = 'Image.Viewer.ZoomOut';
