'use client';

import { ChevronRightIcon } from '@heroicons/react/16/solid';

import { useInternalImageViewerContext } from '../context';
import { ViewerButton, type ImageViewerButtonProps } from './viewer-button';
import { useInternalTranslate } from '../../../../internal/translate';

export type ImageViewerNextProps = ImageViewerButtonProps;

export function ImageViewerNext({ className, ...props }: ImageViewerNextProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Next');
  const t = useInternalTranslate();
  if (viewer.count <= 1) return null;

  return (
    <ViewerButton
      {...props}
      data-image-viewer-step="next"
      className={viewer.styles.next({ className })}
      label={t('common.next')}
      glyph={<ChevronRightIcon aria-hidden="true" />}
      act={viewer.next}
      unavailable={!viewer.canNext}
    />
  );
}

ImageViewerNext.displayName = 'Image.Viewer.Next';
