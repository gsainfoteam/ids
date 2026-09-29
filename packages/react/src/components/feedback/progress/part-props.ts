import type { ComponentProps, ReactNode } from 'react';

import type { Progress } from '.';

export type PartProps<E extends 'span' | 'div'> = Omit<
  ComponentProps<E>,
  'className' | 'children'
> & {
  asChild?: boolean;
  className?: string | ((state: Progress.State) => string | undefined);
  children?: ReactNode;
};

export function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}
