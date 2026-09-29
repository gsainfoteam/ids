'use client';

import { useProgressContext } from './context';
import { resolve, type PartProps } from './part-props';
import { Slot } from '../../utility/slot';

export type ProgressLabelProps = PartProps<'span'>;

export function ProgressLabel({ asChild, className, id, ...props }: ProgressLabelProps) {
  const { state, styles, labelId } = useProgressContext('Progress.Label');
  const Root = asChild ? Slot : 'span';
  return (
    <Root
      {...props}
      id={id ?? labelId}
      data-progress-label=""
      className={styles.label({ className: resolve(className, state) })}
    />
  );
}

ProgressLabel.displayName = 'Progress.Label';
