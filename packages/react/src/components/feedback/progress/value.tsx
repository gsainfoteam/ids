'use client';

import { type ReactNode } from 'react';

import { useProgressContext } from './context';
import { resolve, type PartProps } from './part-props';
import { Slot } from '../../utility/slot';

import type { Progress } from '.';

export type ProgressValueProps = Omit<PartProps<'span'>, 'children'> & {
  children?: ReactNode | ((state: Progress.State) => ReactNode);
};

export function ProgressValue({ asChild, className, children, ...props }: ProgressValueProps) {
  const { state, styles } = useProgressContext('Progress.Value');
  const Root = asChild ? Slot : 'span';
  const content =
    typeof children === 'function' ? children(state) : (children ?? state.valueLabel ?? '');
  return (
    <Root
      aria-hidden="true"
      {...props}
      data-progress-value=""
      className={styles.value({ className: resolve(className, state) })}
    >
      {content}
    </Root>
  );
}

ProgressValue.displayName = 'Progress.Value';
