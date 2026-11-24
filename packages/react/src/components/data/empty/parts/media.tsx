'use client';

import { InboxIcon } from '@heroicons/react/24/outline';

import { useInternalEmptyContext } from '../context';
import { Part, type EmptyPartProps } from './part';

import type { EmptyMediaVariant } from '..';

export type EmptyMediaProps = EmptyPartProps & { variant?: EmptyMediaVariant };

export function EmptyMedia({
  variant = 'soft',
  hidden,
  className,
  children,
  ...props
}: EmptyMediaProps) {
  const { styles } = useInternalEmptyContext('Empty.Media');

  if (hidden === true) return null;

  return (
    <Part
      {...props}
      kind="media"
      data-variant={variant}
      className={styles.media({ media: variant, className })}
    >
      {children ?? <InboxIcon aria-hidden="true" />}
    </Part>
  );
}

EmptyMedia.displayName = 'Empty.Media';
