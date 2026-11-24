'use client';

import { useInternalFieldContext } from '../context';
import { errorShown, present } from '../lib/error-shown';
import { renderPart, type FieldPartProps } from '../lib/part';
import { resolve, stateAttributes } from '../lib/state-value';

import type { FieldErrorState } from '..';
import type { FieldValidityKey } from '../lib/control-state';

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
  const context = useInternalFieldContext('Error');

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
