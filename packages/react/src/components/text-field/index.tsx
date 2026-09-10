import {
  Children,
  isValidElement,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { isNotNil } from 'es-toolkit';

import { invariant, mergeRefs, tv } from '../../utils';
import { IconButton } from '../icon-button';
import {
  TextFieldContext,
  textFieldAdornment,
  textFieldSurface,
  useTextFieldContext,
  type TextFieldInputProps,
  type TextFieldVariant,
} from './surface';

import type { IdsSize } from '../../tokens/types';

function hasText(value: unknown) {
  return value != null && String(value) !== '';
}

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
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(() =>
    hasText(inputProps.defaultValue),
  );

  invariant(
    inputProps.value == null || inputProps.onChange != null || inputProps.readOnly === true,
    '`<TextField>` with `value` requires `onChange` (or `readOnly`).',
  );

  const controlled = inputProps.value !== undefined;
  const { leading, input, trailing } = splitByInput(children);

  function clear() {
    const el = inputRef.current;
    if (el == null) return;

    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  }

  return (
    <TextFieldContext.Provider
      value={{
        size,
        disabled,
        inputProps,
        inputRef,
        hasValue: controlled ? hasText(inputProps.value) : uncontrolledHasValue,
        trackValue: (next) => {
          if (!controlled) setUncontrolledHasValue(hasText(next));
        },
        clear,
      }}
    >
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

    const { inputProps, inputRef, trackValue } = field;
    const onChange = rest.onChange ?? inputProps.onChange;

    return (
      <input
        data-text-field-input=""
        {...inputProps}
        {...rest}
        disabled={disabledProp ?? field.disabled}
        className={Input.Style({ className })}
        style={style}
        ref={mergeRefs(inputRef, inputProps.ref, ref)}
        onChange={(event) => {
          trackValue(event.target.value);
          onChange?.(event);
        }}
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

  export function Clear({ onClear, onClick, ...rest }: Clear.Props) {
    const field = useTextFieldContext();
    invariant(field != null, '`<TextField.Clear>` must be used inside `<TextField>`.');

    if (!field.hasValue || field.disabled) return null;

    return (
      <IconButton
        aria-label="지우기"
        {...rest}
        size={field.size}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        }
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          (onClear ?? field.clear)();
        }}
      />
    );
  }

  export namespace Clear {
    export type Props = Omit<IconButton.Props, 'icon' | 'size' | 'aria-label'> & {
      onClear?: () => void;
      'aria-label'?: string;
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
