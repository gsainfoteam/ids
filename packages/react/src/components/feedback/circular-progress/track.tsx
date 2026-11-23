'use client';

import { circleGeometry, type CirclePartProps } from './circle';
import { useCircularProgressContext } from './context';
import { resolve } from '../progress/part-props';

export type CircularProgressTrackProps = CirclePartProps;

export function CircularProgressTrack({ className, ...props }: CircularProgressTrackProps) {
  const { state, styles } = useCircularProgressContext('CircularProgress.Track');
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
