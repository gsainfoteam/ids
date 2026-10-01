import type { ComponentProps } from 'react';

import type { Alert } from '.';

export type PartProps<E extends 'span' | 'div'> = Omit<ComponentProps<E>, 'className'> & {
  asChild?: boolean;
  className?: string | ((state: Alert.State) => string | undefined);
};

export function resolve<T, S>(value: T | ((state: S) => T), state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}
