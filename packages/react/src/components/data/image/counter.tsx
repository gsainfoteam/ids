'use client';

import { type ComponentProps } from 'react';

import { useImageViewerContext } from './context';
import { useTranslate } from '../../../internal/translate';

export type ImageCounterProps = Omit<ComponentProps<'span'>, 'children'>;

export function ImageCounter({ className, ...rest }: ImageCounterProps) {
  const viewer = useImageViewerContext('Image.Counter');
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

ImageCounter.displayName = 'Image.Counter';
