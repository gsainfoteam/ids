'use client';

import { ChevronLeftIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImagePrevProps = ImageViewerButtonProps;

export function ImagePrev({ className, ...props }: ImagePrevProps) {
  const viewer = useImageViewerContext('Image.Prev');
  const t = useTranslate();
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
      quiet={false}
    />
  );
}

ImagePrev.displayName = 'Image.Prev';
