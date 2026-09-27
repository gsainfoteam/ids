import {
  isValidElement,
  use,
  useCallback,
  useId,
  useRef,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  type RefCallback,
} from 'react';

import { isInvalid, useInputValue, useTextControl } from '../../../internal/text-control';
import { invariant, mergeProps, mergeRefs } from '../../../utils';
import { FieldNotifyContext } from '../field/context';

export type TextFieldInputProps = Omit<
  ComponentProps<'input'>,
  'size' | 'children' | 'className' | 'style' | 'color'
>;

export type UseTextFieldOptions = {
  rootProps: TextFieldInputProps;
  input: TextFieldInputProps & { asChild?: boolean; children?: ReactNode };
  disabled?: boolean;
  invalid?: boolean;
  onValueChange?: (value: string) => void;
  clearable: boolean;
};

export function useTextField({
  rootProps,
  input: { asChild, children, ...own },
  disabled: disabledProp,
  invalid,
  onValueChange,
  clearable,
}: UseTextFieldOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const notify = use(FieldNotifyContext);

  // Values: Input over root over the asChild child. Handlers run child, root, Input, so Field and
  // react-hook-form wiring on the root still runs when the Input sets its own onChange or onBlur.
  const childProps =
    asChild && isValidElement<ComponentProps<'input'>>(children) ? children.props : undefined;
  const native: ComponentProps<'input'> = mergeProps(mergeProps({ ...childProps }, rootProps), own);
  const disabled = Boolean(own.disabled ?? disabledProp ?? childProps?.disabled);
  const readOnly = Boolean(native.readOnly);
  const ariaInvalid = native['aria-invalid'] ?? invalid;

  invariant(
    native.value == null || native.onChange != null || onValueChange != null || readOnly,
    '`<TextField>` with `value` requires `onChange`, `onValueChange` or `readOnly`.',
  );

  const observed = useInputValue(
    inputRef,
    String(native.value ?? native.defaultValue ?? ''),
    notify ?? undefined,
  );
  const filled = (native.value != null ? String(native.value) : observed) !== '';
  const control = useTextControl({ inputRef, disabled, readOnly, clearable });
  const nativeRef = native.ref;
  const ref: RefCallback<HTMLInputElement> = useCallback(
    (node: HTMLInputElement | null) => mergeRefs(inputRef, nativeRef)(node),
    [nativeRef],
  );

  const inputProps = {
    ...native,
    id: native.id ?? `ids-text-field-${generatedId}`,
    disabled,
    'aria-invalid': ariaInvalid,
    'data-field-input': '',
    'data-text-field-input': '',
    ref,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      native.onChange?.(event);
      onValueChange?.(event.currentTarget.value);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      native.onKeyDown?.(event);
      control.onEscape(event);
    },
  };

  return {
    inputProps,
    rootProps: control.rootProps,
    clear: control.clear,
    state: {
      disabled,
      readOnly,
      invalid: isInvalid(ariaInvalid),
      focused: control.focused,
      filled,
    },
  };
}
