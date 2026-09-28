import { useEffect } from 'react';

import { useController, useFormContext, type RegisterOptions } from 'react-hook-form';

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
} from './internal/form-bridge';
import { isDevelopment } from './utils/dev';

type ControlledOptions = Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
export type FieldProps = BaseProps &
  (
    | { controlMode?: 'native'; registerOptions?: RegisterOptions }
    | { controlMode: 'value' | 'checked'; registerOptions?: ControlledOptions }
  );

function NativeField({
  name,
  registerOptions,
  ...props
}: BaseProps & { name: string; registerOptions?: RegisterOptions }) {
  const methods = useFormContext();
  const state = methods.getFieldState(name, methods.formState);
  const disabled = methods.formState.disabled || (props.disabled ?? registerOptions?.disabled);
  const registration = methods.register(name, { ...registerOptions, disabled });
  return (
    <FieldRoot
      {...props}
      name={name}
      disabled={disabled}
      invalid={props.invalid ?? (state.invalid || undefined)}
      dirty={props.dirty ?? state.isDirty}
      touched={props.touched ?? state.isTouched}
      errorMessage={state.error?.message}
      bindControl={(original) =>
        mergeBinding(original, { ...registration, disabled: disabled ?? original.disabled })
      }
    />
  );
}
function ControlledField({
  name,
  registerOptions,
  controlMode = 'value',
  ...props
}: BaseProps & {
  name: string;
  registerOptions?: ControlledOptions;
  controlMode: 'value' | 'checked';
}) {
  const methods = useFormContext();
  const disabled = methods.formState.disabled || (props.disabled ?? registerOptions?.disabled);
  const { field, fieldState } = useController({
    name,
    control: methods.control,
    rules: registerOptions,
    disabled,
  });
  return (
    <FieldRoot
      {...props}
      name={name}
      disabled={disabled}
      invalid={props.invalid ?? (fieldState.invalid || undefined)}
      dirty={props.dirty ?? fieldState.isDirty}
      touched={props.touched ?? fieldState.isTouched}
      errorMessage={fieldState.error?.message}
      bindControl={(original, control) => {
        const { value, onChange, ...binding } = field;
        return mergeBinding(withoutDefaults(original), {
          ...binding,
          ...valueReports(control, controlMode, onChange, { readsNativeEvents: true }),
          [controlMode]: keepInputControlled(value, controlMode),
          disabled: disabled ?? original.disabled,
        });
      }}
    />
  );
}
function RhfField({ name, controlMode = 'native', registerOptions, ...props }: FieldProps) {
  const methods = useFormContext();
  useEffect(() => {
    if (isDevelopment && name && !methods) {
      console.warn('[IDS] Field: automatic registration requires react-hook-form FormProvider.');
    }
  }, [name, methods]);
  if (!methods || !name) return <BaseField {...props} name={name} />;
  return controlMode === 'native' ? (
    <NativeField key={name} {...props} name={name} registerOptions={registerOptions} />
  ) : (
    <ControlledField
      key={`${name}-${controlMode}`}
      {...props}
      name={name}
      registerOptions={registerOptions}
      controlMode={controlMode}
    />
  );
}

export const Field = Object.assign(RhfField, {
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
