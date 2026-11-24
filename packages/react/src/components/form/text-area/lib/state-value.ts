export type StateValue<S, T> = T | ((state: S) => T);

export function resolve<S, T>(value: StateValue<S, T>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}
