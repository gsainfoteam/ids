'use client';

import { skeletonStyle } from './style';
import { cn, mergeRefs } from '../../../utils';
import { Slot } from '../../utility/slot';

import type { Skeleton } from '.';

function countLines(lines: number) {
  return Number.isFinite(lines) ? Math.max(1, Math.floor(lines)) : 1;
}

export function SkeletonRoot({
  shape = 'rect',
  lines = 1,
  animation = 'pulse',
  loading,
  asChild = false,
  className,
  children,
  ref,
  ...rest
}: Skeleton.Props) {
  const wrapsChildren = asChild || loading !== undefined || children != null;

  if (!wrapsChildren) {
    const styles = skeletonStyle({ shape, animation });
    const shapeProps = {
      ...rest,
      'aria-hidden': true,
      'data-skeleton': '',
      'data-shape': shape,
      'data-animation': animation,
    };

    if (shape !== 'text')
      return (
        <span
          {...shapeProps}
          ref={mergeRefs(ref)}
          className={styles.root({ className: cn(styles.paint(), className) })}
        />
      );

    const count = countLines(lines);
    const isShortLastLine = (index: number) => count > 1 && index === count - 1;

    return (
      <span {...shapeProps} ref={mergeRefs(ref)} className={styles.root({ className })}>
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className={styles.line()}>
            <span
              className={styles.bar({ short: isShortLastLine(index), className: styles.paint() })}
            />
          </span>
        ))}
      </span>
    );
  }

  const busy = loading ?? true;
  const styles = skeletonStyle({ animation, wrapping: asChild ? 'child' : 'div', loading: busy });
  const wrapperProps = {
    ...rest,
    'aria-busy': busy || undefined,
    'data-skeleton': '',
    'data-animation': animation,
    'data-loading': busy ? '' : undefined,
    className: styles.root({ className: cn(busy && styles.paint(), className) }),
  };

  if (asChild)
    return (
      <Slot {...wrapperProps} ref={ref} inert={busy || undefined}>
        {children}
      </Slot>
    );

  return (
    <div {...wrapperProps} ref={mergeRefs(ref)}>
      <div data-skeleton-content="" inert={busy || undefined} className={styles.content()}>
        {children}
      </div>
    </div>
  );
}
