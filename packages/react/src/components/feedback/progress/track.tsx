'use client';

import { useProgressContext } from './context';
import { ProgressIndicator } from './indicator';
import { resolve, type PartProps } from './part-props';
import { ARC_RADIUS } from '../../../internal/arc';

export type ProgressTrackProps = Omit<PartProps<'div'>, 'asChild'>;

export function ProgressTrack({ className, children, ...props }: ProgressTrackProps) {
  const { state, styles, progressbar } = useProgressContext('Progress.Track');
  const resolvedClassName = resolve(className, state);
  if (state.shape === 'circular')
    return (
      <circle
        cx="12"
        cy="12"
        r={ARC_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        data-progress-track=""
        className={styles.trackCircle({ className: resolvedClassName })}
      />
    );
  return (
    <div
      {...props}
      {...progressbar}
      data-progress-track=""
      className={styles.track({ className: resolvedClassName })}
    >
      {children ?? <ProgressIndicator />}
    </div>
  );
}

ProgressTrack.displayName = 'Progress.Track';
