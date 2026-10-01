'use client';

import { type ComponentProps } from 'react';

import { PhotoIcon } from '@heroicons/react/24/outline';

import { useImageContext } from './context';

export type ImageFallbackProps = ComponentProps<'span'>;

export function ImageFallback({ className, children, ...rest }: ImageFallbackProps) {
  const { state, alt, styles } = useImageContext('Image.Fallback');
  if (state.status !== 'error') return null;

  const standsForThePicture = !state.preview && alt.trim() !== '';

  return (
    <span
      {...(standsForThePicture ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      {...rest}
      data-image-fallback=""
      className={styles.fallback({ className })}
    >
      {children ?? <PhotoIcon aria-hidden />}
    </span>
  );
}

ImageFallback.displayName = 'Image.Fallback';
