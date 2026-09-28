import {
  isValidElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  isInvalid,
  useInputValue,
  useMergedRef,
  useTextControl,
} from '../../../internal/text-control';
import { invariant, mergeProps } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { FieldNotifyContext } from '../field/context';

export type PasswordFieldInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'children' | 'className' | 'style' | 'color'
>;

export type UsePasswordFieldOptions = {
  rootProps: PasswordFieldInputProps;
  input: PasswordFieldInputProps & { asChild?: boolean; children?: ReactNode };
  disabled?: boolean;
  invalid?: boolean;
  onValueChange?: (value: string) => void;
  visible?: boolean;
  defaultVisible: boolean;
  onVisibleChange?: (visible: boolean) => void;
  clearable: boolean;
};

type Selection = { start: number; end: number; direction: 'forward' | 'backward' | 'none' };

function assertInput(node: HTMLInputElement) {
  invariant(
    node.tagName === 'INPUT',
    '`<PasswordField.Input asChild>` must forward its ref to an input.',
  );
}

function selectOnceLaidOut(node: HTMLInputElement, { start, end, direction }: Selection) {
  node.getBoundingClientRect();
  node.setSelectionRange(start, end, direction);
}

export function inferAutoComplete(name: string | undefined) {
  const leaf = name?.replaceAll('[', '.').replaceAll(']', '.').split('.').filter(Boolean).at(-1);
  return /^new[-_]?password$/i.test(leaf ?? '') ? 'new-password' : 'current-password';
}

export function usePasswordField({
  rootProps,
  input: { asChild, children, ...own },
  disabled: disabledProp,
  invalid,
  onValueChange,
  visible: visibleProp,
  defaultVisible,
  onVisibleChange,
  clearable,
}: UsePasswordFieldOptions) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const notify = use(FieldNotifyContext);

  const childProps =
    asChild && isValidElement<ComponentProps<'input'>>(children) ? children.props : undefined;
  const native: ComponentProps<'input'> = mergeProps(mergeProps({ ...childProps }, rootProps), own);
  const disabled = Boolean(own.disabled ?? disabledProp ?? childProps?.disabled);
  const readOnly = Boolean(native.readOnly);
  const ariaInvalid = native['aria-invalid'] ?? invalid;
  const id = native.id ?? `ids-password-${generatedId}`;

  const [visible, setVisible] = useControllableState({
    value: visibleProp,
    defaultValue: defaultVisible,
    onValueChange: onVisibleChange,
  });
  const [capsLock, setCapsLock] = useState(false);
  const observed = useInputValue(
    inputRef,
    String(native.value ?? native.defaultValue ?? ''),
    notify ?? undefined,
  );
  const filled = (native.value != null ? String(native.value) : observed.value) !== '';
  const control = useTextControl({ inputRef, disabled, readOnly, clearable });
  const ref = useMergedRef(inputRef, childProps?.ref, rootProps.ref, own.ref, assertInput);

  const selectionBeforeTypeSwap = useRef<Selection | null>(null);
  useLayoutEffect(() => {
    const node = inputRef.current;
    const saved = selectionBeforeTypeSwap.current;
    if (node && saved) selectOnceLaidOut(node, saved);
    selectionBeforeTypeSwap.current = null;
  }, [visible]);

  useEffect(() => {
    if (isDevelopment && !native.name)
      console.warn(
        '[IDS] PasswordField: give it a name such as name="password" so password managers recognise it.',
      );
  }, [native.name]);

  const latestSetVisible = useRef(setVisible);
  useLayoutEffect(() => {
    latestSetVisible.current = setVisible;
  });
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    let active = true;
    const hideOnceResetCannotBeCancelled = (event: Event) =>
      setTimeout(() => {
        if (active && !event.defaultPrevented) latestSetVisible.current(false);
      });
    const hideBeforePasswordManagersRead = () => {
      const node = inputRef.current;
      if (node && node.type !== 'password') node.type = 'password';
      latestSetVisible.current(false);
    };
    form.addEventListener('reset', hideOnceResetCannotBeCancelled);
    form.addEventListener('submit', hideBeforePasswordManagersRead, true);
    return () => {
      active = false;
      form.removeEventListener('reset', hideOnceResetCannotBeCancelled);
      form.removeEventListener('submit', hideBeforePasswordManagersRead, true);
    };
  }, [native.form]);

  const readCapsLock = (
    event: KeyboardEvent<HTMLInputElement> | PointerEvent<HTMLInputElement>,
  ) => {
    if (typeof event.getModifierState === 'function')
      setCapsLock(event.getModifierState('CapsLock'));
  };

  const toggle = (byPointer: boolean) => {
    const node = inputRef.current;
    if (!node || disabled) return;
    if (byPointer) node.focus({ preventScroll: true });
    selectionBeforeTypeSwap.current =
      node.selectionStart == null || node.selectionEnd == null
        ? null
        : {
            start: node.selectionStart,
            end: node.selectionEnd,
            direction: node.selectionDirection ?? 'none',
          };
    setVisible(!visible);
  };

  const inputProps = {
    ...native,
    id,
    type: visible ? 'text' : 'password',
    autoComplete: native.autoComplete ?? inferAutoComplete(native.name),
    spellCheck: native.spellCheck ?? false,
    autoCapitalize: native.autoCapitalize ?? 'none',
    autoCorrect: native.autoCorrect ?? 'off',
    disabled,
    'aria-invalid': ariaInvalid,
    'data-field-input': '',
    'data-password-field-input': '',
    ref,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      observed.rereadInOnChangeBatch();
      native.onChange?.(event);
      onValueChange?.(event.currentTarget.value);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      readCapsLock(event);
      native.onKeyDown?.(event);
      control.onEscape(event);
    },
    onKeyUp: (event: KeyboardEvent<HTMLInputElement>) => {
      readCapsLock(event);
      native.onKeyUp?.(event);
    },
    onPointerDown: (event: PointerEvent<HTMLInputElement>) => {
      readCapsLock(event);
      native.onPointerDown?.(event);
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      setCapsLock(false);
      native.onBlur?.(event);
    },
  };

  return {
    inputProps,
    rootProps: control.rootProps,
    clear: control.clear,
    toggle,
    visible,
    capsLock,
    state: {
      disabled,
      readOnly,
      invalid: isInvalid(ariaInvalid),
      focused: control.focused,
      filled,
      visible,
    },
  };
}
