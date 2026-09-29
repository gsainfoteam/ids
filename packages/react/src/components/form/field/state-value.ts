import type { FieldState } from './context';

export type StateValue<S, T> = T | ((state: S) => T);

export function resolve<S, T>(value: StateValue<S, T>, state: S): T {
  return typeof value === 'function' ? (value as (state: S) => T)(state) : value;
}

export function stateAttributes(state: FieldState) {
  return {
    'data-orientation': state.orientation,
    'data-size': state.size,
    'data-invalid': state.invalid ? '' : undefined,
    'data-disabled': state.disabled ? '' : undefined,
    'data-required': state.required ? '' : undefined,
    'data-filled': state.filled ? '' : undefined,
    'data-focused': state.focused ? '' : undefined,
    'data-touched': state.touched ? '' : undefined,
    'data-dirty': state.dirty ? '' : undefined,
  };
}
