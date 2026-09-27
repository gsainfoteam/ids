import {
  isValidElement,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

import { isNotNil } from 'es-toolkit';

import {
  TextFieldContext,
  textFieldAdornment,
  textFieldSurface,
  useTextFieldContext,
  type TextFieldInputProps,
  type TextFieldVariant,
} from './surface';
import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { Slot } from '../../utility/slot';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
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
    input: items[inputIndex] as ReactElement<TextField.Input.Props>,
    trailing: items.slice(inputIndex + 1),
  };
}

export function TextField({
  variant = 'outline',
  size: sizeProp,
  disabled,
  className,
  style,
  children,
  ...inputProps
}: TextField.Props) {
  const size = useFieldSize(sizeProp) ?? 'standard';
  const inputRef = useRef<HTMLInputElement>(null);
  const { leading, input, trailing } = splitByInput(children);

  // The sentinel's own props win over the container's, so validate and derive
  // container state from the merged result, not from the container props alone.
  const merged = { ...inputProps, ...input.props };
  const isDisabled = input.props.disabled ?? disabled;

  invariant(
    merged.value == null || merged.onChange != null || merged.readOnly === true,
    '`<TextField>` with `value` requires `onChange` (or `readOnly`).',
  );

  return (
    <TextFieldContext.Provider value={{ size, disabled: isDisabled, inputProps, inputRef }}>
      <div
        data-text-field=""
        data-variant={variant}
        data-size={size}
        data-disabled={isDisabled ? '' : undefined}
        className={textFieldSurface({ variant, size, className })}
        style={style}
        onMouseDown={(event) => {
          if (isDisabled) return;
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
    <span
      key={(isValidElement(item) && item.key) || index}
      data-text-field-adornment=""
      className={textFieldAdornment({ size })}
    >
      {item}
    </span>
  ));
}

export namespace TextField {
  export function Input({
    asChild,
    children,
    disabled: disabledProp,
    className,
    style,
    ref,
    ...rest
  }: Input.Props) {
    const field = useTextFieldContext();
    invariant(field != null, '`<TextField.Input>` must be used inside `<TextField>`.');

    const { inputProps, inputRef } = field;
    const props = {
      'data-text-field-input': '',
      // Input values win, but handlers compose so Field and react-hook-form wiring on the
      // root still runs when the Input sets its own onChange or onBlur.
      ...mergeProps(inputProps, rest),
      disabled: disabledProp ?? field.disabled,
      className: Input.Style({ className }),
      style,
    };

    if (asChild === true) {
      invariant(
        isValidElement(children) &&
          (typeof children.type !== 'string' || children.type === 'input'),
        '`<TextField.Input asChild>` requires one input, or a component forwarding input props and ref.',
      );
      return (
        <Slot {...(props as Slot.Props)} ref={mergeRefs(inputRef, inputProps.ref, ref)}>
          {children}
        </Slot>
      );
    }
    invariant(children == null, '`<TextField.Input>` takes `value`/`defaultValue`, not children.');
    return <input {...props} ref={mergeRefs(inputRef, inputProps.ref, ref)} />;
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
      asChild?: boolean;
      children?: ReactNode;
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
