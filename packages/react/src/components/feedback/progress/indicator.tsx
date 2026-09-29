'use client';

import { type CSSProperties } from 'react';

import { useProgressContext } from './context';
import { resolve, type PartProps } from './part-props';
import { ARC_CIRCUMFERENCE, ARC_RADIUS } from '../../../internal/arc';
import { Slot } from '../../utility/slot';

export type ProgressIndicatorProps = PartProps<'div'>;

export function ProgressIndicator({
  asChild,
  className,
  style,
  children,
  ...props
}: ProgressIndicatorProps) {
  const { state, styles } = useProgressContext('Progress.Indicator');
  const resolvedClassName = resolve(className, state);
  const ratio = state.percent === null ? null : state.percent / 100;
  if (state.shape === 'circular')
    return (
      <circle
        cx="12"
        cy="12"
        r={ARC_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={ARC_CIRCUMFERENCE}
        strokeDashoffset={ARC_CIRCUMFERENCE * (1 - (ratio ?? 0.25))}
        data-progress-indicator=""
        className={styles.indicatorCircle({ className: resolvedClassName })}
      />
    );
  const Root = asChild ? Slot : 'div';
  return (
    <Root
      {...props}
      data-progress-indicator=""
      className={styles.indicator({ className: resolvedClassName })}
      style={
        { ...(ratio === null ? {} : { '--progress-ratio': ratio }), ...style } as CSSProperties
      }
    >
      {children}
    </Root>
  );
}

ProgressIndicator.displayName = 'Progress.Indicator';
