'use client';

import { type ComponentProps } from 'react';

import { useInternalTranslate } from '../../../../internal/translate';
import { useInternalImageViewerContext } from '../context';

export type ImageViewerCounterProps = Omit<ComponentProps<'span'>, 'children'>;

export function ImageViewerCounter({ className, ...rest }: ImageViewerCounterProps) {
  const viewer = useInternalImageViewerContext('Image.Viewer.Counter');
  const t = useInternalTranslate();
  if (viewer.count <= 1) return null;

  return (
    <span
      aria-hidden="true"
      {...rest}
      data-image-viewer-counter=""
      className={viewer.styles.counter({ className })}
    >
      {t('slides.counter', { index: viewer.index + 1, count: viewer.count })}
    </span>
  );
}

ImageViewerCounter.displayName = 'Image.Viewer.Counter';
