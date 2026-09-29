'use client';

import { use, useEffect } from 'react';

import { createFormHookContexts, type AnyFieldApi } from '@tanstack/react-form';

import {
  Field as BaseField,
  FieldRoot,
  type FieldProps as BaseProps,
} from './components/form/field';
import {
  keepInputControlled,
  mergeBinding,
  valueReports,
  withoutDefaults,
  type ControlMode,
} from './internal/form-bridge';
import { isDevelopment } from './utils/dev';

const { fieldContext: appFieldContext } = createFormHookContexts();

export type FieldProps = BaseProps & {
  field?: AnyFieldApi;
  controlMode?: ControlMode;
};

function messageOf(error: unknown) {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error;
    if (typeof message === 'string') return message;
  }
  return undefined;
}

function BoundField({
  field,
  controlMode,
  ...props
}: BaseProps & { field: AnyFieldApi; controlMode: ControlMode }) {
  const { value, meta } = field.state;
  const errorsShowing = meta.isTouched || field.form.state.submissionAttempts > 0;
  const shownErrors: unknown[] = errorsShowing ? meta.errors : [];
  return (
    <FieldRoot
      {...props}
      name={props.name ?? field.name}
      invalid={props.invalid ?? (shownErrors.length > 0 || undefined)}
      dirty={props.dirty ?? !meta.isDefaultValue}
      touched={props.touched ?? meta.isTouched}
      errorMessage={shownErrors.map(messageOf).find(Boolean)}
      bindControl={(original, control) =>
        mergeBinding(withoutDefaults(original), {
          name: field.name,
          [controlMode]: keepInputControlled(value, controlMode),
          onBlur: field.handleBlur,
          ...valueReports(control, controlMode, (next) => field.handleChange(next), {
            readsNativeEvents: false,
          }),
        })
      }
    />
  );
}

function TanStackField({ field: given, controlMode = 'value', ...props }: FieldProps) {
  const fromAppField = use(appFieldContext);
  const field = given ?? fromAppField;
  useEffect(() => {
    if (isDevelopment && !field) {
      console.warn(
        '[IDS] Field: pass `field` from form.Field, or render it inside form.AppField, to bind TanStack Form.',
      );
    }
  }, [field]);
  if (!field) return <BaseField {...props} />;
  return <BoundField {...props} field={field} controlMode={controlMode} />;
}

export const Field = Object.assign(TanStackField, {
  Label: BaseField.Label,
  Description: BaseField.Description,
  Hint: BaseField.Hint,
  Error: BaseField.Error,
  Style: BaseField.Style,
});

export namespace Field {
  export type Props = FieldProps;
  export type State = BaseField.State;
  export type LabelProps = BaseField.LabelProps;
  export type DescriptionProps = BaseField.DescriptionProps;
  export type HintProps = BaseField.HintProps;
  export type ErrorProps = BaseField.ErrorProps;
}
