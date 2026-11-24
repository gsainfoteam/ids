'use client';

import { Slot } from '../../../utility/slot';
import { resolve } from '../../progress/lib/part-props';
import { useInternalCircularProgressContext } from '../context';

import type { ProgressValueProps } from '../../progress/parts/value';

export type CircularProgressValueProps = ProgressValueProps;

export function CircularProgressValue({
  asChild,
  className,
  children,
  ...props
}: CircularProgressValueProps) {
  const { state, styles } = useInternalCircularProgressContext('CircularProgress.Value');
  const Root = asChild ? Slot : 'span';
  const content =
    typeof children === 'function' ? children(state) : (children ?? state.valueLabel ?? '');
  return (
    <Root
      aria-hidden="true"
      {...props}
      data-circular-progress-value=""
      className={styles.value({ className: resolve(className, state) })}
    >
      {content}
    </Root>
  );
}

CircularProgressValue.displayName = 'CircularProgress.Value';
