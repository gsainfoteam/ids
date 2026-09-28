import type { CSSProperties, ReactNode } from 'react';

export type StateValue<T, S> = T | ((state: S) => T);

export type StateRenderProps<S> = {
  className?: StateValue<string | undefined, S>;
  style?: StateValue<CSSProperties | undefined, S>;
  children?: StateValue<ReactNode, S>;
};

export function resolveState<T, S>(value: StateValue<T, S>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}
