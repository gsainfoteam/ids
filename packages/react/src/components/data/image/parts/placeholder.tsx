'use client';

import { type ComponentProps } from 'react';

import { Skeleton } from '../../../feedback/skeleton';
import { useInternalImageContext } from '../context';

export type ImagePlaceholderProps = Omit<ComponentProps<'span'>, 'ref'>;

export function ImagePlaceholder({ className, children, ...rest }: ImagePlaceholderProps) {
  const { state, styles } = useInternalImageContext('Image.Placeholder');
  if (state.status !== 'loading') return null;

  if (children === undefined)
    return (
      <Skeleton asChild>
        <span
          aria-hidden
          {...rest}
          data-image-placeholder=""
          className={styles.placeholder({ className })}
        />
      </Skeleton>
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
