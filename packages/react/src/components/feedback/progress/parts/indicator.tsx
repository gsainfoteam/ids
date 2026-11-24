'use client';

import { type CSSProperties } from 'react';

import { Slot } from '../../../utility/slot';
import { useInternalProgressContext } from '../context';
import { resolve, type PartProps } from '../lib/part-props';

export type ProgressIndicatorProps = PartProps<'div'>;

export function ProgressIndicator({
  asChild,
  className,
  style,
  children,
  ...props
}: ProgressIndicatorProps) {
  const { state, styles } = useInternalProgressContext('Progress.Indicator');
  const ratio = state.percent === null ? null : state.percent / 100;
  const Root = asChild ? Slot : 'div';
  return (
    <Root
      {...props}
      data-progress-indicator=""
      className={styles.indicator({ className: resolve(className, state) })}
      style={
        { ...(ratio === null ? {} : { '--progress-ratio': ratio }), ...style } as CSSProperties
      }
    >
      {children}
    </Root>
  );
}

ProgressIndicator.displayName = 'Progress.Indicator';
