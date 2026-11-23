'use client';

import { skeletonStyle } from './style';
import { cn, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Skeleton } from '.';

export function SkeletonRoot({
  animation = 'pulse',
  loading = true,
  asChild = false,
  className,
  children,
  ref,
  ...rest
}: Skeleton.Props) {
  const styles = skeletonStyle({ animation, wrapping: asChild ? 'child' : 'div', loading });
  const wrapperProps = {
    ...rest,
    'aria-busy': loading || undefined,
    'data-skeleton': '',
    'data-animation': animation,
    'data-loading': loading ? '' : undefined,
    className: styles.root({ className: cn(loading && styles.paint(), className) }),
  };

  if (asChild)
    return (
      <Slot {...wrapperProps} ref={ref} inert={loading || undefined}>
        {children}
      </Slot>
    );

  return (
    <div {...wrapperProps} ref={mergeRefs(ref)}>
      <div data-skeleton-content="" inert={loading || undefined} className={styles.content()}>
        {children}
      </div>
    </div>
  );
}
