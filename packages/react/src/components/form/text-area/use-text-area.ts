import {
  isValidElement,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from 'react';

import {
  isInvalid,
  useInputValue,
  useMergedRef,
  useTextControl,
} from '../../../internal/text-control';
import { invariant, mergeProps } from '../../../utils';
import { FieldNotifyContext } from '../field/context';

export type TextAreaInputProps = Omit<
  ComponentProps<'textarea'>,
  'children' | 'className' | 'style' | 'color'
>;

export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export type UseTextAreaOptions = {
  rootProps: TextAreaInputProps;
  input: TextAreaInputProps & { asChild?: boolean; children?: ReactNode };
  disabled?: boolean;
  invalid?: boolean;
  onValueChange?: (value: string) => void;
  autoResize: boolean;
  resize?: TextAreaResize;
  minRows?: number;
  maxRows?: number;
  countId?: string;
};

function assertTextarea(node: HTMLTextAreaElement) {
  invariant(
    node.tagName === 'TEXTAREA',
    '`<TextArea.Input asChild>` must forward its ref to a textarea.',
  );
}

export function useTextArea({
  rootProps,
  input: { asChild, children, ...own },
  disabled: disabledProp,
  invalid,
  onValueChange,
  autoResize,
  resize,
  minRows,
  maxRows,
  countId,
}: UseTextAreaOptions) {
  invariant(
    !autoResize || resize == null || resize === 'none',
    '`<TextArea>` cannot use `resize` together with `autoResize`.',
  );
  for (const [name, value] of Object.entries({ minRows, maxRows })) {
    invariant(
      value == null || (Number.isInteger(value) && value > 0),
      `\`<TextArea>\` \`${name}\` must be a positive integer.`,
    );
  }
  invariant(
    minRows == null || maxRows == null || minRows <= maxRows,
    '`<TextArea>` `minRows` must not exceed `maxRows`.',
  );

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const generatedId = useId();
  const notify = use(FieldNotifyContext);

  // Values: Input over root over the asChild child. Handlers run child, root, Input, so Field and
  // react-hook-form wiring on the root still runs when the Input sets its own onChange or onBlur.
  const childProps =
    asChild && isValidElement<ComponentProps<'textarea'>>(children) ? children.props : undefined;
  const native: ComponentProps<'textarea'> = mergeProps(
    mergeProps({ ...childProps }, rootProps),
    own,
  );
  const disabled = Boolean(own.disabled ?? disabledProp ?? childProps?.disabled);
  const readOnly = Boolean(native.readOnly);
  const ariaInvalid = native['aria-invalid'] ?? invalid;

  invariant(
    native.value == null || native.onChange != null || onValueChange != null || readOnly,
    '`<TextArea>` with `value` requires `onChange`, `onValueChange` or `readOnly`.',
  );

  const observed = useInputValue(
    inputRef,
    String(native.value ?? native.defaultValue ?? ''),
    notify ?? undefined,
  );
  const value = native.value != null ? String(native.value) : observed;
  const control = useTextControl({ inputRef, disabled, readOnly });

  const ref = useMergedRef(inputRef, childProps?.ref, rootProps.ref, own.ref, assertTextarea);

  const inputProps = {
    ...native,
    id: native.id ?? `ids-text-area-${generatedId}`,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby':
      [native['aria-describedby'], countId].filter(Boolean).join(' ') || undefined,
    'data-field-input': '',
    'data-text-area-input': '',
    ref,
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
      native.onChange?.(event);
      onValueChange?.(event.currentTarget.value);
    },
  };

  const maxLength =
    typeof native.maxLength === 'number' && native.maxLength >= 0 ? native.maxLength : undefined;

  return {
    inputProps,
    rootProps: control.rootProps,
    count: { length: value.length, maxLength },
    state: {
      disabled,
      readOnly,
      invalid: isInvalid(ariaInvalid),
      focused: control.focused,
      filled: value !== '',
    },
  };
}

export type CountState = {
  count: number;
  maxLength: number | undefined;
  remaining: number | undefined;
  nearLimit: boolean;
  atLimit: boolean;
};

export function countState(length: number, maxLength: number | undefined, threshold?: number) {
  const remaining = maxLength === undefined ? undefined : maxLength - length;
  const warnAt =
    threshold ?? (maxLength === undefined ? 0 : Math.max(10, Math.ceil(maxLength * 0.1)));
  return {
    count: length,
    maxLength,
    remaining,
    nearLimit: remaining !== undefined && remaining <= warnAt,
    atLimit: remaining !== undefined && remaining <= 0,
  } satisfies CountState;
}

// Announcing every keystroke would drown out the typing, so the live region only speaks once the
// count is near the limit, and only after typing pauses.
export function useCountAnnouncement(message: string, delay = 600) {
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setSpoken(message), message ? delay : 0);
    return () => window.clearTimeout(timer);
  }, [message, delay]);
  return spoken;
}
