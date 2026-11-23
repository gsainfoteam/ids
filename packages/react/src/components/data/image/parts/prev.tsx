'use client';

import { ChevronLeftIcon } from '@heroicons/react/16/solid';

import { useInternalImageViewerContext } from '../context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type ImageViewerPrevProps = ImageViewerButtonProps;

export function ImageViewerPrev({ className, ...props }: ImageViewerPrevProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Prev');
  const t = useInternalTranslate();
  if (viewer.count <= 1) return null;

  return (
    <ViewerButton
      {...props}
      data-image-viewer-step="prev"
      className={viewer.styles.prev({ className })}
      label={t('image.previous')}
      glyph={<ChevronLeftIcon aria-hidden="true" />}
      act={viewer.prev}
      unavailable={!viewer.canPrev}
    />
  );
}

ImageViewerPrev.displayName = 'Image.Viewer.Prev';
