'use client';

import { Label as BaseLabel } from '../../../typography/label';
import { FieldLabelContext, useInternalFieldContext, type FieldState } from '../context';
import { resolve, stateAttributes } from '../lib/state-value';

import type { FieldPartProps } from '../lib/part';

export type FieldLabelProps = FieldPartProps<'label', FieldState> & { required?: boolean };

export function FieldLabel({ required, className, style, children, ...rest }: FieldLabelProps) {
  const { controlId, state } = useInternalFieldContext('Label');

  return (
    <FieldLabelContext value>
      <BaseLabel
        {...rest}
        htmlFor={controlId}
        size={state.size}
        required={required ?? state.required}
        disabled={state.disabled}
        aria-invalid={state.invalid || undefined}
        data-field-part="label"
        {...stateAttributes(state)}
        className={resolve(className, state)}
        style={resolve(style, state)}
      >
        {resolve(children, state)}
      </BaseLabel>
    </FieldLabelContext>
  );
}

FieldLabel.displayName = 'Field.Label';
