import {
  Children,
  Fragment,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { ChevronUpIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { addDecimal, clampNumber, createNumberFormat, shiftDecimal } from './number-format';
import { invariant, mergeProps, mergeRefs, tv } from '../../utils';
import { useFieldSize } from '../field/context';
import { IconButton } from '../icon-button';

import type { IdsSize } from '../../tokens/types';

type NativeInputProps = ComponentProps<'input'>;
export type NumberFieldVariant = 'outline' | 'filled' | 'unstyled';
export type NumberFieldProps = Omit<
  NativeInputProps,
  | 'type'
  | 'size'
  | 'color'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
> & {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
  hideStepper?: boolean;
  invalid?: boolean;
  size?: IdsSize;
  variant?: NumberFieldVariant;
  incrementLabel?: string;
  decrementLabel?: string;
  clearLabel?: string;
  children?: ReactNode;
};

type NumberContext = {
  id: string;
  size: IdsSize;
  disabled: boolean;
  readOnly: boolean;
  empty: boolean;
  canIncrease: boolean;
  canDecrease: boolean;
  incrementLabel: string;
  decrementLabel: string;
  clearLabel: string;
  changeBy: (direction: 1 | -1, large?: boolean) => void;
  clear: () => void;
  focus: () => void;
};
const Context = createContext<NumberContext | null>(null);
function useNumberContext() {
  const context = useContext(Context);
  invariant(context, 'NumberField parts must be inside NumberField.');
  return context;
}
function flatten(children: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(children).flatMap((child, index) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children, `${prefix}${index}:`)
      : [isValidElement(child) ? cloneElement(child, { key: `${prefix}${child.key}` }) : child],
  );
}
function NumberInput(_props: NumberField.InputProps): ReactNode {
  invariant(
    false,
    'NumberField.Input must be a direct child of NumberField (or inside a Fragment).',
  );
}
function StepIcon({ direction }: { direction: 1 | -1 }) {
  return direction === 1 ? (
    <ChevronUpIcon aria-hidden="true" />
  ) : (
    <ChevronDownIcon aria-hidden="true" />
  );
}
function NumberStepper({ asChild, children, ...props }: NumberField.StepperProps) {
  const context = useNumberContext();
  const buttons = (
    <>
      {([1, -1] as const).map((direction) => (
        <IconButton
          key={direction}
          type="button"
          size={context.size}
          variant="ghost"
          icon={<StepIcon direction={direction} />}
          aria-label={direction === 1 ? context.incrementLabel : context.decrementLabel}
          aria-controls={context.id}
          disabled={
            context.disabled ||
            context.readOnly ||
            !(direction === 1 ? context.canIncrease : context.canDecrease)
          }
          className="h-5 w-6 min-w-0 rounded-sm p-0 [&_svg]:size-3"
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => {
            context.changeBy(direction, event.shiftKey);
            context.focus();
          }}
        />
      ))}
    </>
  );
  const merged = mergeProps(
    { 'data-number-field-stepper': '', className: 'flex shrink-0 flex-col' },
    props,
  );
  if (asChild) {
    invariant(
      isValidElement<ComponentProps<'div'>>(children) && children.type !== Fragment,
      'NumberField.Stepper asChild requires one non-interactive wrapper.',
    );
    invariant(
      typeof children.type !== 'string' || !['button', 'input', 'a'].includes(children.type),
      'NumberField.Stepper asChild requires a non-interactive wrapper.',
    );
    return cloneElement(children, mergeProps({ ...children.props }, merged), buttons);
  }
  invariant(children == null, 'NumberField.Stepper supplies its own buttons.');
  return <div {...merged}>{buttons}</div>;
}
function NumberClear({ asChild, onClear, children, ...props }: NumberField.ClearProps) {
  const context = useNumberContext();
  if (context.empty) return null;
  const internal: Omit<ComponentProps<'button'>, 'children'> = {
    type: 'button',
    'aria-label': context.clearLabel,
    'aria-controls': context.id,
    disabled: context.disabled || context.readOnly || props.disabled,
    onPointerDown: (event) => event.preventDefault(),
    onClick: () => {
      if (onClear) onClear();
      else context.clear();
      context.focus();
    },
  };
  if (asChild) {
    invariant(
      isValidElement<ComponentProps<'button'>>(children) && children.type !== Fragment,
      'NumberField.Clear asChild requires one button or a component forwarding button props/ref.',
    );
    invariant(
      typeof children.type !== 'string' || children.type === 'button',
      'NumberField.Clear asChild must render a button.',
    );
    return cloneElement(
      children,
      mergeProps(mergeProps({ ...children.props }, props), { ...internal }),
    );
  }
  return (
    <IconButton
      {...mergeProps(props, { ...internal })}
      size={context.size}
      variant="ghost"
      aria-label={props['aria-label'] ?? context.clearLabel}
      className="size-6 min-w-0 p-0"
      icon={<XMarkIcon aria-hidden="true" />}
    />
  );
}

export function NumberField({
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  step = 1,
  largeStep = shiftDecimal(step, 1),
  locale = 'en-US',
  formatOptions,
  hideStepper = false,
  invalid,
  size,
  variant = 'outline',
  incrementLabel = 'Increase value',
  decrementLabel = 'Decrease value',
  clearLabel = 'Clear value',
  children,
  className,
  style,
  ...rootProps
}: NumberFieldProps) {
  for (const [name, candidate] of Object.entries({
    value,
    defaultValue,
    min,
    max,
    step,
    largeStep,
  })) {
    invariant(
      candidate == null || (typeof candidate === 'number' && Number.isFinite(candidate)),
      `NumberField: ${name} must be a finite number.`,
    );
  }
  invariant(min == null || max == null || min <= max, 'NumberField: min은 max보다 작아야 합니다.');
  invariant(step > 0 && largeStep > 0, 'NumberField: step과 largeStep은 양수여야 합니다.');
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const generatedId = useId();
  const parts = flatten(children);
  const sentinels = parts.filter((part) => isValidElement(part) && part.type === NumberInput);
  invariant(sentinels.length <= 1, 'NumberField: Input은 한 번만 명시할 수 있습니다.');
  invariant(
    parts.length === 0 || sentinels.length === 1,
    'NumberField: children require one NumberField.Input.',
  );
  const sentinel = sentinels[0] as ReactElement<NumberField.InputProps> | undefined;
  const { asChild, children: inputChild, ...inputProps } = sentinel?.props ?? {};
  let child: ReactElement<NativeInputProps> | undefined;
  if (asChild) {
    invariant(
      isValidElement<NativeInputProps>(inputChild) && inputChild.type !== Fragment,
      'NumberField.Input asChild requires one input or a component forwarding input props/ref.',
    );
    invariant(
      typeof inputChild.type !== 'string' || inputChild.type === 'input',
      'NumberField.Input asChild must render an input.',
    );
    child = inputChild;
  } else
    invariant(inputChild == null, 'NumberField.Input does not accept children without asChild.');
  const native: NativeInputProps = mergeProps(
    mergeProps({ ...child?.props }, inputProps),
    rootProps,
  );
  const disabled = !!native.disabled;
  const readOnly = !!native.readOnly;
  const id = native.id ?? `ids-number-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const forwardedRef = native.ref;
  const ref = (node: HTMLInputElement | null) => {
    invariant(
      !node || node.tagName === 'INPUT',
      'NumberField.Input asChild must forward its ref to an input.',
    );
    inputRef.current = node;
    const cleanup = mergeRefs(forwardedRef)(node);
    return () => {
      inputRef.current = null;
      cleanup?.();
    };
  };
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const current = controlled ? value : uncontrolledValue;
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState<{ text: string; value: number | null; format: object } | null>(
    null,
  );
  const composing = useRef(false);
  const formatKey = JSON.stringify(formatOptions ?? null);
  const format = useMemo(
    () => createNumberFormat(locale, JSON.parse(formatKey) ?? undefined),
    [locale, formatKey],
  );
  const display =
    focused && draft && Object.is(draft.value, current) && draft.format === format
      ? draft.text
      : focused
        ? format.edit(current)
        : format.format(current);
  const change = (next: number | null) => {
    if (Object.is(next, current)) return;
    if (!controlled) setUncontrolledValue(next);
    onChange?.(next);
  };
  const normalize = () => {
    const parsed = format.parse(inputRef.current?.value ?? display);
    const next = parsed
      ? parsed.value == null
        ? null
        : clampNumber(parsed.value, min, max)
      : current;
    setDraft(null);
    change(next);
    return next;
  };
  const accept = (text: string) => {
    const parsed = format.parse(text);
    if (!parsed) {
      setDraft(null);
      return;
    }
    setDraft({ ...parsed, format });
    change(parsed.value);
  };
  const changeBy = (direction: 1 | -1, large = false) => {
    if (disabled || readOnly) return;
    const base = current ?? 0;
    const amount = large ? largeStep : step;
    const next =
      current == null && (base < (min ?? -Infinity) || base > (max ?? Infinity))
        ? clampNumber(base, min, max)
        : clampNumber(addDecimal(base, direction * amount), min, max);
    if (!Number.isFinite(next)) return;
    setDraft(null);
    change(next);
  };
  useLayoutEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    let active = true;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        if (!controlled) setUncontrolledValue(defaultValue);
        setDraft(null);
      });
    form.addEventListener('reset', reset);
    return () => {
      active = false;
      form.removeEventListener('reset', reset);
    };
  }, [controlled, defaultValue, native.form]);
  const outOfRange =
    current != null && (current < (min ?? -Infinity) || current > (max ?? Infinity));
  const ariaInvalid = native['aria-invalid'] ?? invalid ?? (outOfRange || undefined);
  const actual: NativeInputProps = {
    ...native,
    id,
    ref,
    type: 'text',
    role: 'spinbutton',
    name: undefined,
    value: display,
    defaultValue: undefined,
    inputMode: native.inputMode ?? 'decimal',
    min,
    max,
    step,
    'aria-valuenow': current ?? undefined,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuetext': current == null ? undefined : format.format(current),
    'aria-invalid': ariaInvalid,
    ...{ 'data-number-field-input': '', 'data-size': resolvedSize },
    className: inputStyle({ className: native.className }),
    onFocus: (event) => {
      native.onFocus?.(event);
      setFocused(true);
      setDraft(null);
    },
    onBlur: (event) => {
      composing.current = false;
      normalize();
      setFocused(false);
      native.onBlur?.(event);
    },
    onChange: (event) => {
      native.onChange?.(event);
      if (event.defaultPrevented || disabled || readOnly) return;
      if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
        setDraft({ text: event.target.value, value: current, format });
        return;
      }
      accept(event.target.value);
    },
    onCompositionStart: (event) => {
      composing.current = true;
      native.onCompositionStart?.(event);
    },
    onCompositionEnd: (event) => {
      composing.current = false;
      if (!disabled && !readOnly) accept(event.currentTarget.value);
      native.onCompositionEnd?.(event);
    },
    onKeyDown: (event) => {
      native.onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        disabled ||
        readOnly ||
        composing.current ||
        event.nativeEvent.isComposing
      )
        return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'PageUp' ||
        event.key === 'PageDown'
      ) {
        event.preventDefault();
        changeBy(
          event.key === 'ArrowUp' || event.key === 'PageUp' ? 1 : -1,
          event.shiftKey || event.key.startsWith('Page'),
        );
      } else if (event.key === 'Enter') normalize();
      else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !format.allowsKey(event.key)
      )
        event.preventDefault();
    },
  };
  // React.cloneElement forwards callback refs without reading ref.current.
  // eslint-disable-next-line react-hooks/refs
  const input = child ? cloneElement(child, actual) : <input {...actual} />;
  const inputIndex = sentinel ? parts.indexOf(sentinel) : -1;
  const lead = sentinel ? parts.slice(0, inputIndex) : [];
  const trail = sentinel ? parts.slice(inputIndex + 1) : [];
  const explicitSteppers = parts.filter(
    (part) => isValidElement(part) && part.type === NumberStepper,
  );
  invariant(explicitSteppers.length <= 1, 'NumberField: Stepper must be declared at most once.');
  const context: NumberContext = {
    id,
    size: resolvedSize,
    disabled,
    readOnly,
    empty: current == null && !display,
    canIncrease: current == null || current < (max ?? Infinity),
    canDecrease: current == null || current > (min ?? -Infinity),
    incrementLabel,
    decrementLabel,
    clearLabel,
    changeBy,
    clear: () => {
      if (!disabled && !readOnly) {
        setDraft(null);
        change(null);
      }
    },
    focus: () => inputRef.current?.focus(),
  };
  return (
    <Context.Provider value={context}>
      <div
        data-number-field=""
        data-size={resolvedSize}
        data-variant={variant}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-invalid={
          ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== 'false' ? '' : undefined
        }
        className={NumberField.Style({ variant, size: resolvedSize, className })}
        style={style}
      >
        {lead.length > 0 && (
          <div data-number-field-part="lead" className="inline-flex shrink-0 items-center gap-1">
            {lead}
          </div>
        )}
        {input}
        {trail.length > 0 && (
          <div data-number-field-part="trail" className="inline-flex shrink-0 items-center gap-1">
            {trail}
          </div>
        )}
        {!hideStepper && explicitSteppers.length === 0 && <NumberStepper />}
      </div>
      {native.name && (
        <input
          type="hidden"
          name={native.name}
          form={native.form}
          disabled={disabled}
          value={current ?? ''}
        />
      )}
    </Context.Provider>
  );
}
const inputStyle = tv({
  base: 'h-full w-full min-w-0 flex-1 border-0 bg-transparent text-inherit outline-none placeholder:text-(--ids-color-on-muted) disabled:cursor-not-allowed',
});

export namespace NumberField {
  export type Props = NumberFieldProps;
  export type InputProps = Omit<NativeInputProps, 'type' | 'size' | 'value' | 'defaultValue'> & {
    asChild?: boolean;
  };
  export type StepperProps = ComponentProps<'div'> & { asChild?: boolean };
  export type ClearProps = ComponentProps<'button'> & { asChild?: boolean; onClear?: () => void };
  export const Input = NumberInput;
  export const Stepper = NumberStepper;
  export const Clear = NumberClear;
  export const Style = tv({
    base: [
      'inline-flex w-full min-w-0 items-center gap-2 text-(--ids-color-on-surface)',
      '[--ids-number-field-danger:var(--ids-field-danger,#b42318)]',
      '[[data-mode=dark]_&]:[--ids-number-field-danger:var(--ids-field-danger,#fda29b)]',
      'data-disabled:cursor-not-allowed data-disabled:opacity-40',
      'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
      'has-[:focus-visible]:outline-(--ids-color-primary)',
    ],
    variants: {
      variant: {
        outline:
          'inset-ring-1 inset-ring-(--ids-color-outline) hover:inset-ring-(--ids-color-primary)',
        filled:
          'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent hover:bg-(--ids-color-primary)/15',
        unstyled: '',
      } satisfies Record<NumberFieldVariant, string>,
      size: {
        standard: 'h-11 rounded-xl px-3 text-body-b2-regular',
        tiny: 'h-8 gap-1 rounded-lg px-2 text-body-b3-regular [&_[data-number-field-stepper]_button]:h-3.5',
      } satisfies Record<IdsSize, string>,
    },
    compoundVariants: [
      {
        variant: ['outline', 'filled'],
        class:
          'data-invalid:inset-ring-1 data-invalid:inset-ring-(--ids-number-field-danger) data-invalid:has-[:focus-visible]:outline-(--ids-number-field-danger)',
      },
    ],
  });
}
