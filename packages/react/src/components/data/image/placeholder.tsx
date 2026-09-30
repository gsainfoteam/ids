'use client';

import { type ComponentProps } from 'react';

import { useImageContext } from './context';
import { Skeleton } from '../../feedback/skeleton';

export type ImagePlaceholderProps = Omit<ComponentProps<'span'>, 'ref'>;

export function ImagePlaceholder({ className, children, ...rest }: ImagePlaceholderProps) {
  const { state, styles } = useImageContext('Image.Placeholder');
  if (state.status !== 'loading') return null;

  if (children === undefined)
    return (
      <Skeleton {...rest} data-image-placeholder="" className={styles.placeholder({ className })} />
    );

  return (
    <span
      aria-hidden
      {...rest}
      data-image-placeholder=""
      className={styles.placeholder({ className, painted: true })}
    >
      {children}
    </span>
  );
}

ImagePlaceholder.displayName = 'Image.Placeholder';
