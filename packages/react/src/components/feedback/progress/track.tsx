'use client';

import { useProgressContext } from './context';
import { ProgressIndicator } from './indicator';
import { resolve, type PartProps } from './part-props';

export type ProgressTrackProps = Omit<PartProps<'div'>, 'asChild'>;

export function ProgressTrack({ className, children, ...props }: ProgressTrackProps) {
  const { state, styles, progressbar } = useProgressContext('Progress.Track');
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
