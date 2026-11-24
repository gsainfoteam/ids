'use client';

import { MagnifyingGlassPlusIcon } from '@heroicons/react/16/solid';

import { useInternalImageViewerContext } from '../context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type ImageViewerZoomInProps = ImageViewerButtonProps;

export function ImageViewerZoomIn(props: ImageViewerZoomInProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.ZoomIn');
  const t = useInternalTranslate();

  return (
    <ViewerButton
      {...props}
      label={t('image.zoomIn')}
      glyph={<MagnifyingGlassPlusIcon aria-hidden="true" />}
      act={viewer.zoomIn}
      unavailable={!viewer.canZoomIn}
    />
  );
}

ImageViewerZoomIn.displayName = 'Image.Viewer.ZoomIn';
