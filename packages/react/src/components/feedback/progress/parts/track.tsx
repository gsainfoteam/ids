'use client';

import { useInternalProgressContext } from '../context';
import { ProgressIndicator } from './indicator';
import { resolve, type PartProps } from '../lib/part-props';

export type ProgressTrackProps = Omit<PartProps<'div'>, 'asChild'>;

export function ProgressTrack({ className, children, ...props }: ProgressTrackProps) {
  const { state, styles, progressbar } = useInternalProgressContext('Progress.Track');
  return (
    <div
      {...props}
      {...progressbar}
      data-progress-track=""
      className={styles.track({ className: resolve(className, state) })}
    >
      {children ?? <ProgressIndicator />}
    </div>
  );
}

ProgressTrack.displayName = 'Progress.Track';
