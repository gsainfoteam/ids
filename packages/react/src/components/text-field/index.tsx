import { Children, isValidElement, useRef, type CSSProperties, type ReactNode } from 'react';

import { isNotNil } from 'es-toolkit';

import {
  TextFieldContext,
  textFieldAdornment,
  textFieldSurface,
  useTextFieldContext,
  type TextFieldInputProps,
  type TextFieldVariant,
} from './surface';
import { invariant, mergeRefs, tv } from '../../utils';

import type { IdsSize } from '../../tokens/types';

function splitByInput(children: ReactNode) {
  const items = Children.toArray(children);
  const inputIndexes = items
    .map((child, index) => (isValidElement(child) && child.type === TextField.Input ? index : null))
    .filter(isNotNil);

  invariant(inputIndexes.length <= 1, '`<TextField>` accepts at most one `<TextField.Input />`.');

  const inputIndex = inputIndexes[0];
  if (inputIndex == null) {
    return { leading: items, input: <TextField.Input />, trailing: [] as ReactNode[] };
  }

  return {
    leading: items.slice(0, inputIndex),
    input: items[inputIndex],
    trailing: items.slice(inputIndex + 1),
  };
}

export function TextField({
  variant = 'outline',
  size = 'standard',
  disabled,
  className,
  style,
  children,
  ...inputProps
}: TextField.Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  invariant(
    inputProps.value == null || inputProps.onChange != null || inputProps.readOnly === true,
    '`<TextField>` with `value` requires `onChange` (or `readOnly`).',
  );

  const { leading, input, trailing } = splitByInput(children);

  return (
    <TextFieldContext.Provider value={{ size, disabled, inputProps, inputRef }}>
      <div
        data-text-field=""
        data-variant={variant}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        className={textFieldSurface({ variant, size, className })}
        style={style}
        onMouseDown={(event) => {
          if (disabled) return;
          const target = event.target as HTMLElement;
          if (target.closest('button, a, input, textarea, select, label')) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Adornments items={leading} size={size} />
        {input}
        <Adornments items={trailing} size={size} />
      </div>
    </TextFieldContext.Provider>
  );
}

function Adornments({ items, size }: { items: ReactNode[]; size: IdsSize }) {
  return items.map((item, index) => (
    <span key={index} data-text-field-adornment="" className={textFieldAdornment({ size })}>
      {item}
    </span>
  ));
}

export namespace TextField {
  export function Input({ disabled: disabledProp, className, style, ref, ...rest }: Input.Props) {
    const field = useTextFieldContext();
    invariant(field != null, '`<TextField.Input>` must be used inside `<TextField>`.');

    const { inputProps, inputRef } = field;

    return (
      <input
        data-text-field-input=""
        {...inputProps}
        {...rest}
        disabled={disabledProp ?? field.disabled}
        className={Input.Style({ className })}
        style={style}
        ref={mergeRefs(inputRef, inputProps.ref, ref)}
      />
    );
  }

  export namespace Input {
    export const Style = tv({
      base: [
        'min-w-0 flex-1 bg-transparent outline-none',
        'text-inherit placeholder:text-(--ids-color-on-muted)',
        'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed',
      ],
    });

    export type Props = TextFieldInputProps & {
      disabled?: boolean;
      className?: string;
      style?: CSSProperties;
    };
  }

  export type Props = TextFieldInputProps & {
    variant?: TextFieldVariant;
    size?: IdsSize;
    disabled?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
  };
}

export {
  TextFieldContext,
  textFieldAdornment,
  textFieldSurface,
  useTextFieldContext,
  type TextFieldContextValue,
  type TextFieldInputProps,
  type TextFieldVariant,
} from './surface';
