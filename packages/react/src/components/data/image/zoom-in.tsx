'use client';

import { MagnifyingGlassPlusIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageViewerZoomInProps = ImageViewerButtonProps;

export function ImageViewerZoomIn(props: ImageViewerZoomInProps) {
  const viewer = useImageViewerContext('Image.Viewer.ZoomIn');
  const t = useTranslate();

  return (
    <ViewerButton
      {...props}
      label={t('image.zoomIn')}
      glyph={<MagnifyingGlassPlusIcon aria-hidden="true" />}
      act={viewer.zoomIn}
      unavailable={!viewer.canZoomIn}
      quiet
    />
  );
}

ImageViewerZoomIn.displayName = 'Image.Viewer.ZoomIn';
