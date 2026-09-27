import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { useTextField, type TextFieldInputProps } from './use-text-field';
import { type FieldSurfaceVariant } from '../../../internal/field-surface';
import {
  Adornments,
  TextControlClear,
  TextControlContext,
  countOf,
  splitAroundInput,
  stateAttributes,
  textControlStyle,
  type TextControlClearProps,
  type TextControlState,
} from '../../../internal/text-control';
import { cn, invariant } from '../../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { TextFieldInputProps } from './use-text-field';
export type TextFieldVariant = FieldSurfaceVariant;
export type TextFieldState = TextControlState;

type StateValue<T> = T | ((state: TextFieldState) => T);

type TextFieldContextValue = {
  inputProps: ReturnType<typeof useTextField>['inputProps'];
  styles: ReturnType<typeof TextField.Style>;
};

const TextFieldContext = createContext<TextFieldContextValue | null>(null);

function resolve<T>(value: StateValue<T>, state: TextFieldState): T {
  return typeof value === 'function' ? (value as (state: TextFieldState) => T)(state) : value;
}

export function TextField({
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
    TextField.Input,
    () => <TextField.Input />,
    'TextField',
  );
  const field = useTextField({
    rootProps,
    input: input.props,
    disabled,
    invalid,
    onValueChange,
    clearable: countOf(items, TextField.Clear) > 0,
  });
  const state: TextFieldState = { size, variant, ...field.state };
  const styles = TextField.Style({ variant, size });

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
            own={[TextField.Clear]}
            marker="text-field"
            className={styles.adornment()}
          />
          {input}
          <Adornments
            items={trailing}
            own={[TextField.Clear]}
            marker="text-field"
            className={styles.adornment()}
          />
        </div>
      </TextControlContext>
    </TextFieldContext>
  );
}

export namespace TextField {
  export type Props = TextFieldInputProps & {
    variant?: TextFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    invalid?: boolean;
    onValueChange?: (value: string) => void;
    children?: ReactNode;
    className?: StateValue<string | undefined>;
    style?: StateValue<CSSProperties | undefined>;
  };
  export type State = TextFieldState;
  export type Variant = TextFieldVariant;
  export type ClearProps = TextControlClearProps;

  export function Input({ asChild, children, className, style }: Input.Props) {
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
        isValidElement(children) &&
          (typeof children.type !== 'string' || children.type === 'input'),
        '`<TextField.Input asChild>` requires one input, or a component forwarding input props and ref.',
      );
      return cloneElement(children, props);
    }
    invariant(children == null, '`<TextField.Input>` takes `value`/`defaultValue`, not children.');
    return <input {...props} />;
  }

  export namespace Input {
    export type Props = TextFieldInputProps & {
      asChild?: boolean;
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
    };
  }

  // Shown only while there is something to clear. It clears through a real edit, so onChange,
  // react-hook-form and undo all see it, and it hands focus back to the input.
  export const Clear = TextControlClear;

  export const Style = textControlStyle;
}

export type TextFieldProps = TextField.Props;
