'use client';

import { Slot } from '../../../utility/slot';
import { resolve, type PartProps } from '../../progress/lib/part-props';
import { useInternalCircularProgressContext } from '../context';

export type CircularProgressLabelProps = PartProps<'span'>;

export function CircularProgressLabel({
  asChild,
  className,
  id,
  ...props
}: CircularProgressLabelProps) {
  const { state, styles, labelId } = useInternalCircularProgressContext('CircularProgress.Label');
  const Root = asChild ? Slot : 'span';
  return (
    <Root
      {...props}
      id={id ?? labelId}
      data-circular-progress-label=""
      className={styles.label({ className: resolve(className, state) })}
    />
  );
}

CircularProgressLabel.displayName = 'CircularProgress.Label';
