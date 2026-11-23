'use client';

import { useCircularProgressContext } from './context';
import { Slot } from '../../utility/slot';
import { resolve } from '../progress/part-props';

import type { ProgressValueProps } from '../progress/value';

export type CircularProgressValueProps = ProgressValueProps;

export function CircularProgressValue({
  asChild,
  className,
  children,
  ...props
}: CircularProgressValueProps) {
  const { state, styles } = useCircularProgressContext('CircularProgress.Value');
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
