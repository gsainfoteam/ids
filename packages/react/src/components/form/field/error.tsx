'use client';

import { useFieldContext } from './context';
import { errorShown, present } from './error-shown';
import { renderPart, type FieldPartProps } from './part';
import { resolve, stateAttributes } from './state-value';

import type { FieldErrorState } from '.';
import type { FieldValidityKey } from './control-state';

export type FieldErrorProps = FieldPartProps<'div', FieldErrorState> & {
  match?: FieldValidityKey;
};

export function FieldError({
  asChild,
  match,
  className,
  style,
  children,
  ...rest
}: FieldErrorProps) {
  const context = useFieldContext('Error');

  if (!errorShown({ match, children }, context)) return null;

  const { state, errorMessage, validity, styles } = context;
  const fallback = match === undefined ? (errorMessage ?? validity?.message) : validity?.message;
  const errorState: FieldErrorState = {
    ...state,
    message: present(fallback) ? fallback : undefined,
    validity: validity?.flags ?? null,
  };

  return renderPart(
    'Error',
    asChild,
    {
      ...rest,
      'data-field-part': 'error',
      'data-match': match,
      ...stateAttributes(state),
      className: styles.error({ className: resolve(className, errorState) }),
      style: resolve(style, errorState),
    },
    typeof children === 'function' ? children(errorState) : (children ?? errorState.message),
  );
}

FieldError.displayName = 'Field.Error';
