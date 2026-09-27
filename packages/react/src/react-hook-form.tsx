import { useEffect, type Ref } from 'react';

import { useController, useFormContext, type RegisterOptions } from 'react-hook-form';

import { Field as BaseField, FieldRoot, type FieldProps as BaseProps } from './components/field';

type ControlledOptions = Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
export type FieldProps = BaseProps &
  (
    | { controlMode?: 'native'; registerOptions?: RegisterOptions }
    | { controlMode: 'value' | 'checked'; registerOptions?: ControlledOptions }
  );
type Props = Record<string, unknown>;

// RHF must observe changes even when a consumer handler prevents the default action.
function bind(props: Props, binding: Props) {
  const result = { ...props, ...binding };
  for (const key of ['onChange', 'onBlur']) {
    result[key] = (...args: unknown[]) => {
      (props[key] as ((...args: unknown[]) => void) | undefined)?.(...args);
      (binding[key] as ((...args: unknown[]) => void) | undefined)?.(...args);
    };
  }
  result.ref = (node: HTMLElement | null) => {
    const refs = [props.ref, binding.ref] as Array<Ref<HTMLElement> | undefined>;
    const cleanups = refs.map((ref) => {
      if (typeof ref === 'function') {
        const cleanup = ref(node);
        return typeof cleanup === 'function' ? cleanup : () => ref(null);
      }
      if (ref) {
        ref.current = node;
        return () => {
          ref.current = null;
        };
      }
      return undefined;
    });
    return () => cleanups.forEach((cleanup) => cleanup?.());
  };
  return result;
}

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
      invalid={props.invalid ?? state.invalid}
      errorMessage={state.error?.message}
      bindControl={(original) =>
        bind(original, { ...registration, disabled: disabled ?? original.disabled })
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
      invalid={props.invalid ?? fieldState.invalid}
      errorMessage={fieldState.error?.message}
      bindControl={(original) => {
        const { value, ...binding } = field;
        // A native text input needs a string for an unset value; custom controls may use null.
        const resolvedValue =
          value === undefined ? (controlMode === 'checked' ? false : '') : value;
        const { defaultValue: _defaultValue, defaultChecked: _defaultChecked, ...rest } = original;
        return bind(rest, {
          ...binding,
          [controlMode]: resolvedValue,
          disabled: disabled ?? original.disabled,
        });
      }}
    />
  );
}
function RhfField({ name, controlMode = 'native', registerOptions, ...props }: FieldProps) {
  const methods = useFormContext();
  useEffect(() => {
    if (import.meta.env.DEV && name && !methods) {
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

/** Same anatomy as the base Field; FormProvider + name enables automatic binding. */
export const Field = Object.assign(RhfField, {
  Label: BaseField.Label,
  Description: BaseField.Description,
  Hint: BaseField.Hint,
  Error: BaseField.Error,
});
