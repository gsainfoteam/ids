import type { CheckboxState } from '.';

export type StateProp<T> = T | ((state: CheckboxState) => T);

export function resolve<T>(value: StateProp<T>, state: CheckboxState): T {
  return typeof value === 'function' ? (value as (state: CheckboxState) => T)(state) : value;
}

export function dataState(state: CheckboxState) {
  if (state.indeterminate) return 'indeterminate';
  return state.checked ? 'checked' : 'unchecked';
}
