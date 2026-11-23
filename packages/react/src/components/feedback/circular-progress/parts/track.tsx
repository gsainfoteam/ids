'use client';

import { resolve } from '../../progress/lib/part-props';
import { useInternalCircularProgressContext } from '../context';
import { circleGeometry, type CirclePartProps } from '../lib/circle';

export type CircularProgressTrackProps = CirclePartProps;

export function CircularProgressTrack({ className, ...props }: CircularProgressTrackProps) {
  const { state, styles } = useInternalCircularProgressContext('CircularProgress.Track');
  return (
    <circle
      {...circleGeometry}
      {...props}
      data-circular-progress-track=""
      className={styles.track({ className: resolve(className, state) })}
    />
  );
}

CircularProgressTrack.displayName = 'CircularProgress.Track';
