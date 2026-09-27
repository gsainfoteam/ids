import { useEffect, type ReactElement, type Ref } from 'react';

import { useController, useFormContext, type RegisterOptions } from 'react-hook-form';

import {
  Field as BaseField,
  FieldRoot,
  type FieldProps as BaseProps,
} from './components/form/field';
import { isDevelopment } from './utils/dev';

type ControlledOptions = Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
export type FieldProps = BaseProps &
  (
    | { controlMode?: 'native'; registerOptions?: RegisterOptions }
    | { controlMode: 'value' | 'checked'; registerOptions?: ControlledOptions }
  );
type Props = Record<string, unknown>;
type Handler = (...args: unknown[]) => void;

function bind(props: Props, binding: Props) {
  const result = { ...props, ...binding };
  for (const key of Object.keys(binding)) {
    if (!/^on[A-Z]/.test(key)) continue;
    result[key] = (...args: unknown[]) => {
      (props[key] as Handler | undefined)?.(...args);
      (binding[key] as Handler | undefined)?.(...args);
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

function isEvent(value: unknown) {
  return (
    typeof value === 'object' && value !== null && 'target' in value && 'currentTarget' in value
  );
}

function reportsFor(
  control: ReactElement,
  controlMode: 'value' | 'checked',
  onChange: (value: unknown) => void,
) {
  if (typeof control.type === 'string') return { onChange };
  let reported = false;
  const once = (value: unknown) => {
    if (reported) return;
    reported = true;
    queueMicrotask(() => {
      reported = false;
    });
    onChange(value);
  };
  return {
    [controlMode === 'checked' ? 'onCheckedChange' : 'onValueChange']: once,
    onChange: (next: unknown) => {
      if (!isEvent(next)) once(next);
    },
  };
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
      invalid={props.invalid ?? (state.invalid || undefined)}
      dirty={props.dirty ?? state.isDirty}
      touched={props.touched ?? state.isTouched}
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
      invalid={props.invalid ?? (fieldState.invalid || undefined)}
      dirty={props.dirty ?? fieldState.isDirty}
      touched={props.touched ?? fieldState.isTouched}
      errorMessage={fieldState.error?.message}
      bindControl={(original, control) => {
        const { value, onChange, ...binding } = field;
        const resolvedValue =
          value === undefined ? (controlMode === 'checked' ? false : '') : value;
        const { defaultValue: _defaultValue, defaultChecked: _defaultChecked, ...rest } = original;
        return bind(rest, {
          ...binding,
          ...reportsFor(control, controlMode, onChange),
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
