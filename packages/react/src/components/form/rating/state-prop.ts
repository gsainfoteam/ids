export type StateProp<T, S> = T | ((state: S) => T);

export function resolve<T, S>(value: StateProp<T, S>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}
