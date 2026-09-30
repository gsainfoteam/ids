'use client';

import { MagnifyingGlassPlusIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageZoomInProps = ImageViewerButtonProps;

export function ImageZoomIn(props: ImageZoomInProps) {
  const viewer = useImageViewerContext('Image.ZoomIn');
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

ImageZoomIn.displayName = 'Image.ZoomIn';
