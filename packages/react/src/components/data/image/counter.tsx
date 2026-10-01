'use client';

import { type ComponentProps } from 'react';

import { useImageViewerContext } from './context';
import { useTranslate } from '../../../internal/translate';

export type ImageViewerCounterProps = Omit<ComponentProps<'span'>, 'children'>;

export function ImageViewerCounter({ className, ...rest }: ImageViewerCounterProps) {
  const viewer = useImageViewerContext('Image.Viewer.Counter');
  const t = useTranslate();
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
