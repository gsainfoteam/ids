import type { SliderState } from '.';

export type StateProp<T, S = SliderState> = T | ((state: S) => T);

export function resolve<T, S>(value: StateProp<T, S>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}
