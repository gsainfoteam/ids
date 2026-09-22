import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../tokens/types';

type NativeProps = ComponentProps<'input'>;
export type OTPFieldVariant = 'outline' | 'filled' | 'underline';
export type OTPFieldPattern = 'numeric' | 'alphanumeric' | RegExp;
export type OTPFieldProps = Omit<
  NativeProps,
  | 'type'
  | 'size'
  | 'color'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'pattern'
  | 'maxLength'
  | 'minLength'
> & {
  length: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  pattern?: OTPFieldPattern;
  mask?: boolean;
  invalid?: boolean;
  size?: IdsSize;
  variant?: OTPFieldVariant;
  children?: ReactNode;
};
function flatten(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children, `${prefix}${index}:`)
      : [isValidElement(child) ? cloneElement(child, { key: `${prefix}${child.key}` }) : child],
  );
}
function OTPSlot(_props: OTPField.SlotProps): ReactNode {
  invariant(false, 'OTPField.Slot must be a direct child of OTPField (or inside a Fragment).');
}
function OTPSeparator({ asChild, children = '−', ...props }: OTPField.SeparatorProps) {
  const merged = mergeProps({ className: 'px-0.5 text-(--ids-color-on-muted)' }, props);
  if (asChild) {
    invariant(
      isValidElement<ComponentProps<'span'>>(children) && children.type !== Fragment,
      'OTPField.Separator asChild requires one non-interactive element.',
    );
    return cloneElement(children, {
      ...mergeProps({ ...children.props }, merged),
      'aria-hidden': true,
    });
  }
  return (
    <span {...merged} aria-hidden="true">
      {children}
    </span>
  );
}
function normalizeCode(raw: string, pattern: OTPFieldPattern, length: number): string {
  const expression =
    pattern === 'numeric'
      ? /^[0-9]$/
      : pattern === 'alphanumeric'
        ? /^[a-z0-9]$/i
        : new RegExp(`^(?:${pattern.source})$`, pattern.flags.replace(/[gy]/g, ''));
  return Array.from(raw.normalize('NFKC'))
    .filter((character) => expression.test(character))
    .slice(0, length)
    .join('');
}
function joinIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined;
}

export function OTPField({
  length,
  value,
  defaultValue = '',
  onChange,
  onComplete,
  pattern = 'numeric',
  mask = false,
  invalid,
  size,
  variant = 'outline',
  children,
  className,
  style,
  ref: forwardedRef,
  ...rootProps
}: OTPFieldProps) {
  invariant(
    Number.isInteger(length) && length >= 1 && length <= 12,
    'OTPField: length는 1~12 사이여야 합니다.',
  );
  invariant(
    pattern === 'numeric' || pattern === 'alphanumeric' || pattern instanceof RegExp,
    'OTPField: pattern must be numeric, alphanumeric, or RegExp.',
  );
  invariant(
    typeof defaultValue === 'string' && (value === undefined || typeof value === 'string'),
    'OTPField: value/defaultValue must be strings.',
  );
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const generatedId = useId();
  const id = rootProps.id ?? `ids-otp-${generatedId}`;
  const controlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() =>
    normalizeCode(defaultValue, pattern, length),
  );
  const current = normalizeCode(controlled ? value : uncontrolled, pattern, length);
  // Persist a shorter/stricter configuration so removed characters do not reappear later.
  if (!controlled && uncontrolled !== current) setUncontrolled(current);
  const characters = Array.from(current);
  const [active, setActive] = useState(0);
  const [composition, setComposition] = useState<{ index: number; text: string } | null>(null);
  const composing = useRef<number | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const group = useRef<HTMLDivElement>(null);
  const normalize = (raw: string) => normalizeCode(raw, pattern, length);
  useLayoutEffect(() => {
    const form = inputs.current[0]?.form;
    if (!form) return;
    let mounted = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!mounted || event.defaultPrevented) return;
        if (!controlled) setUncontrolled(normalizeCode(defaultValue, pattern, length));
        setActive(0);
        setComposition(null);
        composing.current = null;
      });
    form.addEventListener('reset', reset);
    return () => {
      mounted = false;
      form.removeEventListener('reset', reset);
    };
  }, [controlled, defaultValue, length, pattern, rootProps.form]);
  const change = (next: string) => {
    if (next === current) return;
    if (!controlled) setUncontrolled(next);
    onChange?.(next);
    if (Array.from(next).length === length) onComplete?.(next);
  };
  const focus = (index: number) => {
    const target = Math.max(0, Math.min(length - 1, index));
    setActive(target);
    inputs.current[target]?.focus({ preventScroll: true });
    inputs.current[target]?.select();
  };
  const erase = (index: number, backward: boolean) => {
    const target = backward && index >= characters.length ? characters.length - 1 : index;
    if (target >= 0 && target < characters.length)
      change(characters.filter((_, i) => i !== target).join(''));
    if (backward) focus(Math.max(0, index - 1));
  };
  const accept = (index: number, text: string) => {
    const accepted = Array.from(normalize(text));
    if (!accepted.length) return;
    // Full-code paste/autofill replaces the complete code from any focused box.
    const start = accepted.length >= length ? 0 : Math.min(index, characters.length);
    const next = [
      ...characters.slice(0, start),
      ...accepted,
      ...characters.slice(start + accepted.length),
    ]
      .slice(0, length)
      .join('');
    change(next);
    focus(Math.min(start + accepted.length, length - 1));
  };
  const declared = flatten(children);
  invariant(
    declared.every(
      (part) => isValidElement(part) && (part.type === OTPSlot || part.type === OTPSeparator),
    ),
    'OTPField: children must be Slot or Separator (or a Fragment).',
  );
  const parts = declared.length
    ? declared
    : Array.from({ length }, (_, index) => <OTPSlot key={index} index={index} />);
  const slots = parts.filter(
    (part) => isValidElement(part) && part.type === OTPSlot,
  ) as ReactElement<OTPField.SlotProps>[];
  invariant(slots.length === length, 'OTPField: Slot 개수와 length가 일치해야 합니다.');
  invariant(
    slots.every((slot, index) => slot.props.index === index),
    'OTPField: Slot indices must appear in order from 0 to length − 1.',
  );
  const ariaInvalid = rootProps['aria-invalid'] ?? invalid;
  const groupLabel = rootProps['aria-label'] ?? '인증 코드';
  // The map creates input callbacks; refs are read only when those callbacks run.
  // eslint-disable-next-line react-hooks/refs
  const rendered = parts.map((part, position) => {
    if (!isValidElement<OTPField.SlotProps>(part) || part.type !== OTPSlot) return part;
    const { index, asChild, children: slotChild, ...slotProps } = part.props;
    let child: ReactElement<NativeProps> | undefined;
    if (asChild) {
      invariant(
        isValidElement<NativeProps>(slotChild) && slotChild.type !== Fragment,
        'OTPField.Slot asChild requires one input or a component forwarding input props/ref.',
      );
      invariant(
        typeof slotChild.type !== 'string' || slotChild.type === 'input',
        'OTPField.Slot asChild must render an input.',
      );
      child = slotChild;
    } else invariant(slotChild == null, 'OTPField.Slot children require asChild.');
    const native: NativeProps = mergeProps(mergeProps({ ...child?.props }, slotProps), rootProps);
    const positionId = `${id}-position-${index}`;
    const ref = (node: HTMLInputElement | null) => {
      invariant(
        !node || node.tagName === 'INPUT',
        'OTPField.Slot asChild must forward its ref to an input.',
      );
      inputs.current[index] = node;
      const cleanup = mergeRefs(native.ref, index === 0 ? forwardedRef : undefined)(node);
      return () => {
        inputs.current[index] = null;
        cleanup?.();
      };
    };
    const actual: NativeProps = {
      ...native,
      ref,
      id: index === 0 ? id : `${id}-${index}`,
      name: undefined,
      type: mask ? 'password' : 'text',
      value: composition?.index === index ? composition.text : (characters[index] ?? ''),
      defaultValue: undefined,
      inputMode: native.inputMode ?? (pattern === 'numeric' ? 'numeric' : 'text'),
      autoComplete: native.autoComplete ?? (index === 0 ? 'one-time-code' : 'off'),
      autoFocus: index === 0 && rootProps.autoFocus,
      maxLength: undefined,
      minLength: undefined,
      pattern: undefined,
      spellCheck: native.spellCheck ?? false,
      autoCapitalize: native.autoCapitalize ?? 'none',
      tabIndex: Math.min(active, length - 1) === index ? (rootProps.tabIndex ?? 0) : -1,
      'aria-label': native['aria-labelledby']
        ? undefined
        : `${groupLabel}, ${index + 1} / ${length}`,
      'aria-labelledby': native['aria-labelledby']
        ? joinIds(native['aria-labelledby'], positionId)
        : undefined,
      'aria-invalid': ariaInvalid,
      ...{
        'data-otp-slot': index,
        'data-size': resolvedSize,
        'data-filled': characters[index] ? '' : undefined,
      },
      className: OTPField.SlotStyle({ variant, size: resolvedSize, className: native.className }),
      onFocus: (event) => {
        native.onFocus?.(event);
        setActive(index);
        if (!event.defaultPrevented) event.currentTarget.select();
      },
      onBlur: (event) => {
        // RHF becomes touched when leaving the group, not while moving between boxes.
        if (!group.current?.contains(event.relatedTarget as Node | null)) native.onBlur?.(event);
      },
      onChange: (event) => {
        native.onChange?.(event);
        if (event.defaultPrevented || native.disabled || native.readOnly) return;
        const raw = event.currentTarget.value;
        const inputEvent = event.nativeEvent as InputEvent;
        if (composing.current === index || inputEvent.isComposing) {
          setComposition({ index, text: raw });
          return;
        }
        if (!raw) erase(index, false);
        else
          accept(
            index,
            inputEvent.inputType === 'insertText' && inputEvent.data ? inputEvent.data : raw,
          );
      },
      onPaste: (event) => {
        native.onPaste?.(event);
        if (event.defaultPrevented || native.disabled || native.readOnly) return;
        event.preventDefault();
        accept(index, event.clipboardData.getData('text'));
      },
      onCompositionStart: (event) => {
        composing.current = index;
        setComposition({ index, text: event.currentTarget.value });
        native.onCompositionStart?.(event);
      },
      onCompositionEnd: (event) => {
        composing.current = null;
        setComposition(null);
        native.onCompositionEnd?.(event);
        if (!event.defaultPrevented && !native.disabled && !native.readOnly)
          accept(index, event.currentTarget.value);
      },
      onKeyDown: (event) => {
        native.onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          native.disabled ||
          composing.current != null ||
          event.nativeEvent.isComposing ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        )
          return;
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          focus(
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? length - 1
                : index + (event.key === 'ArrowRight' ? 1 : -1),
          );
        } else if (!native.readOnly && (event.key === 'Backspace' || event.key === 'Delete')) {
          event.preventDefault();
          erase(index, event.key === 'Backspace');
        } else if (!native.readOnly && Array.from(event.key).length === 1) {
          event.preventDefault();
          accept(index, event.key);
        }
      },
    };
    const input = child ? cloneElement(child, actual) : <input {...actual} />;
    return (
      <Fragment key={part.key ?? position}>
        <span id={positionId} className="sr-only">
          {index + 1} / {length}
        </span>
        {input}
      </Fragment>
    );
  });
  return (
    <>
      <div
        ref={group}
        id={`${id}-group`}
        role="group"
        dir="ltr"
        data-otp-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-disabled={rootProps.disabled ? '' : undefined}
        data-readonly={rootProps.readOnly ? '' : undefined}
        data-invalid={
          ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false' ? '' : undefined
        }
        aria-label={rootProps['aria-labelledby'] ? undefined : groupLabel}
        aria-labelledby={rootProps['aria-labelledby']}
        aria-describedby={rootProps['aria-describedby']}
        className={OTPField.Style({ className })}
        style={style}
      >
        {rendered}
      </div>
      {rootProps.name && (
        <input
          type="hidden"
          name={rootProps.name}
          form={rootProps.form}
          disabled={rootProps.disabled}
          value={current}
        />
      )}
    </>
  );
}
export namespace OTPField {
  export type Props = OTPFieldProps;
  export type SlotProps = Omit<NativeProps, 'type' | 'size' | 'value' | 'defaultValue'> & {
    index: number;
    asChild?: boolean;
  };
  export type SeparatorProps = ComponentProps<'span'> & { asChild?: boolean };
  export const Slot = OTPSlot;
  export const Separator = OTPSeparator;
  export const Style = tv({
    base: [
      'inline-flex max-w-full flex-wrap items-center gap-2 text-(--ids-color-on-surface)',
      '[--ids-otp-danger:var(--ids-field-danger,#b42318)]',
      '[[data-mode=dark]_&]:[--ids-otp-danger:var(--ids-field-danger,#fda29b)]',
      'data-disabled:opacity-40',
    ],
  });
  export const SlotStyle = tv({
    base: [
      'box-border min-w-0 shrink-0 bg-transparent text-center font-medium outline-none',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ids-color-primary)',
      'caret-(--ids-color-primary) disabled:cursor-not-allowed',
      'aria-invalid:inset-ring-(--ids-otp-danger) aria-invalid:focus-visible:outline-(--ids-otp-danger)',
    ],
    variants: {
      variant: {
        outline:
          'rounded-lg inset-ring-1 inset-ring-(--ids-color-outline) hover:inset-ring-(--ids-color-primary)',
        filled:
          'rounded-lg bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent hover:bg-(--ids-color-primary)/15',
        underline:
          'rounded-none border-b-2 border-(--ids-color-outline) aria-invalid:border-(--ids-otp-danger)',
      } satisfies Record<OTPFieldVariant, string>,
      size: { standard: 'size-10 text-lg', tiny: 'size-8 text-sm' } satisfies Record<
        IdsSize,
        string
      >,
    },
  });
}
