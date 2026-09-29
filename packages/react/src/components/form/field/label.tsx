'use client';

import { FieldLabelContext, useFieldContext, type FieldState } from './context';
import { resolve, stateAttributes } from './state-value';
import { Label as BaseLabel } from '../../typography/label';

import type { FieldPartProps } from './part';

export type FieldLabelProps = FieldPartProps<'label', FieldState>;

export function FieldLabel({ className, style, children, ...rest }: FieldLabelProps) {
  const { controlId, state } = useFieldContext('Label');

  return (
    <FieldLabelContext value>
      <BaseLabel
        {...rest}
        htmlFor={controlId}
        size={state.size}
        required={state.required}
        disabled={state.disabled}
        invalid={state.invalid}
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
