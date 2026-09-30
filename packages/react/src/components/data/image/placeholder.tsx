'use client';

import { type ComponentProps } from 'react';

import { useImageContext } from './context';

export type ImagePlaceholderProps = ComponentProps<'span'>;

export function ImagePlaceholder({ className, children, ...rest }: ImagePlaceholderProps) {
  const { state, styles } = useImageContext('Image.Placeholder');
  if (state.status !== 'loading') return null;

  return (
    <span
      aria-hidden
      {...rest}
      data-image-placeholder=""
      className={styles.placeholder({ className, pulse: children === undefined })}
    >
      {children}
    </span>
  );
}

ImagePlaceholder.displayName = 'Image.Placeholder';
