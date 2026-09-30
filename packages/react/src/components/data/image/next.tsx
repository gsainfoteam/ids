'use client';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { useImageViewerContext } from './context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useTranslate } from '../../../internal/translate';

export type ImageNextProps = ImageViewerButtonProps;

export function ImageNext({ className, ...props }: ImageNextProps) {
  const viewer = useImageViewerContext('Image.Next');
  const t = useTranslate();
  if (viewer.count <= 1) return null;

  return (
    <ViewerButton
      {...props}
      data-image-viewer-step="next"
      className={viewer.styles.next({ className })}
      label={t('image.next')}
      glyph={<ChevronRightIcon aria-hidden="true" />}
      act={viewer.next}
      unavailable={!viewer.canNext}
      quiet={false}
    />
  );
}

ImageNext.displayName = 'Image.Next';
