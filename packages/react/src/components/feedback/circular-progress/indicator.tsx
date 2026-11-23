'use client';

import { circleGeometry, type CirclePartProps } from './circle';
import { useCircularProgressContext } from './context';
import { ARC_CIRCUMFERENCE } from '../../../internal/arc';
import { resolve } from '../progress/part-props';

export type CircularProgressIndicatorProps = CirclePartProps;

const INDETERMINATE_ARC_SHARE = 0.25;

export function CircularProgressIndicator({ className, ...props }: CircularProgressIndicatorProps) {
  const { state, styles } = useCircularProgressContext('CircularProgress.Indicator');
  const ratio = state.percent === null ? INDETERMINATE_ARC_SHARE : state.percent / 100;
  return (
    <circle
      {...circleGeometry}
      strokeLinecap="round"
      strokeDasharray={ARC_CIRCUMFERENCE}
      strokeDashoffset={ARC_CIRCUMFERENCE * (1 - ratio)}
      {...props}
      data-circular-progress-indicator=""
      className={styles.indicator({ className: resolve(className, state) })}
    />
  );
}

CircularProgressIndicator.displayName = 'CircularProgress.Indicator';
