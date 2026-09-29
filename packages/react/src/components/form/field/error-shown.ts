import type { ReactNode } from 'react';

import type { FieldContextValue } from './context';
import type { FieldValidityKey } from './control-state';

export function present(value: ReactNode) {
  return value != null && value !== false && value !== '';
}

export function errorShown(
  { match, children }: { match?: FieldValidityKey; children?: unknown },
  { state, errorMessage, validity }: Pick<FieldContextValue, 'state' | 'errorMessage' | 'validity'>,
) {
  if (!state.invalid) return false;
  if (match !== undefined) return validity?.flags[match] === true;
  return (
    typeof children === 'function' ||
    present(children as ReactNode) ||
    present(errorMessage) ||
    present(validity?.message)
  );
}
