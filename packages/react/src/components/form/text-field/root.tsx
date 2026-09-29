'use client';

import { cloneElement, createContext, isValidElement, use } from 'react';

import { useTextField } from './use-text-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  textControlStyle,
  type TextControlState,
} from '../../../internal/text-control';
import { cn, invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { TextField } from '.';

export type TextFieldVariant = FieldSurfaceVariant;
export type TextFieldState = TextControlState;

export type StateValue<T> = T | ((state: TextFieldState) => T);

type TextFieldContextValue = {
  inputProps: ReturnType<typeof useTextField>['inputProps'];
  styles: ReturnType<typeof textControlStyle>;
};

const TextFieldContext = createContext<TextFieldContextValue | null>(null);

function resolve<T>(value: StateValue<T>, state: TextFieldState): T {
  return typeof value === 'function' ? (value as (state: TextFieldState) => T)(state) : value;
}

export function TextFieldRoot({
  variant = 'outline',
  size: sizeProp,
  disabled,
  invalid,
  onValueChange,
  className,
  style,
  children,
  ...rootProps
}: TextField.Props) {
  const size = useFieldSize(sizeProp) ?? 'standard';
  const { items, leading, input, trailing } = splitAroundInput<TextField.Input.Props>(
    children,
    TextFieldInput,
    () => <TextFieldInput />,
    'TextField',
  );
  const field = useTextField({
    rootProps,
    input: input.props,
    disabled,
    invalid,
    onValueChange,
    clearable: countOf(items, TextControlClear) > 0,
  });
  const state: TextFieldState = { size, variant, ...field.state };
  const styles = textControlStyle({ variant, size });

  return (
    <TextFieldContext value={{ inputProps: field.inputProps, styles }}>
      <TextControlContext
        value={{ state, inputId: field.inputProps.id, clear: field.clear, styles }}
      >
        <div
          data-text-field=""
          {...stateAttributes(state)}
          {...field.rootProps}
          className={styles.root({ className: resolve(className, state) })}
          style={resolve(style, state)}
        >
          <Adornments
            items={leading}
            own={[TextControlClear]}
            marker="text-field"
            className={styles.adornment()}
          />
          {input}
          <Adornments
            items={trailing}
            own={[TextControlClear]}
            marker="text-field"
            className={styles.adornment()}
          />
        </div>
      </TextControlContext>
    </TextFieldContext>
  );
}

export function TextFieldInput({ asChild, children, className, style }: TextField.Input.Props) {
  const context = use(TextFieldContext);
  invariant(context != null, '`<TextField.Input>` must be used inside `<TextField>`.');
  const props = {
    ...context.inputProps,
    className: context.styles.input({ className: cn(context.inputProps.className, className) }),
    style:
      context.inputProps.style || style ? { ...context.inputProps.style, ...style } : undefined,
  };

  if (asChild === true) {
    invariant(
      isValidElement(children) && (typeof children.type !== 'string' || children.type === 'input'),
      '`<TextField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );
    return cloneElement(children, props);
  }
  invariant(children == null, '`<TextField.Input>` takes `value`/`defaultValue`, not children.');
  return <input {...props} />;
}

TextFieldInput.displayName = 'TextField.Input';
