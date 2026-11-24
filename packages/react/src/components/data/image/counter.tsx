'use client';

import { type ComponentProps } from 'react';

import { useImageViewerContext } from './context';
import { useIntlWords } from '../../../internal/translate';

export type ImageViewerCounterProps = Omit<ComponentProps<'span'>, 'children'>;

export function ImageViewerCounter({ className, ...rest }: ImageViewerCounterProps) {
  const viewer = useImageViewerContext('Image.Viewer.Counter');
  const words = useIntlWords();
  if (viewer.count <= 1) return null;

  return (
    <span
      aria-hidden="true"
      {...rest}
      data-image-viewer-counter=""
      className={viewer.styles.counter({ className })}
    >
      {words.ratio(viewer.index + 1, viewer.count)}
    </span>
  );
}

ImageViewerCounter.displayName = 'Image.Viewer.Counter';
