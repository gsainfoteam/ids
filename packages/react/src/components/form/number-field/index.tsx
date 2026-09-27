import {
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
import { isNotNil } from 'es-toolkit';

import { addDecimal, clampNumber, createNumberFormat, shiftDecimal } from './number-format';
import { flattenFragments, invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { IconButton } from '../../action/icon-button';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

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
  rootProps: NumberFieldRootInputProps;
  inputProps: (native: NativeInputProps) => NativeInputProps;
  changeBy: (direction: 1 | -1, large?: boolean) => void;
  clear: () => void;
  focus: () => void;
};
type NumberFieldRootInputProps = Omit<
  NumberFieldProps,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'min'
  | 'max'
  | 'step'
  | 'largeStep'
  | 'locale'
  | 'formatOptions'
  | 'hideStepper'
  | 'invalid'
  | 'size'
  | 'variant'
  | 'incrementLabel'
  | 'decrementLabel'
  | 'clearLabel'
  | 'children'
  | 'className'
  | 'style'
>;
const Context = createContext<NumberContext | null>(null);
function useNumberContext() {
  const context = useContext(Context);
  invariant(context, 'NumberField parts must be inside NumberField.');
  return context;
}
function splitByInput(children: ReactNode) {
  const items = flattenFragments(children);
  const inputIndexes = items
    .map((child, index) => (isValidElement(child) && child.type === NumberInput ? index : null))
    .filter(isNotNil);
  invariant(
    inputIndexes.length <= 1,
    '`<NumberField>` accepts at most one `<NumberField.Input />`.',
  );
  const inputIndex = inputIndexes[0];
  if (inputIndex == null) {
    return {
      items,
      leading: items,
      input: <NumberInput />,
      trailing: [] as ReactNode[],
    };
  }
  return {
    items,
    leading: items.slice(0, inputIndex),
    input: items[inputIndex] as ReactElement<NumberField.InputProps>,
    trailing: items.slice(inputIndex + 1),
  };
}
function NumberInput({ asChild, children, ...own }: NumberField.InputProps) {
  const context = useContext(Context);
  invariant(context != null, '`<NumberField.Input>` must be used inside `<NumberField>`.');
  let child: ReactElement<NativeInputProps> | undefined;
  if (asChild) {
    invariant(
      isValidElement<NativeInputProps>(children) &&
        children.type !== Fragment &&
        (typeof children.type !== 'string' || children.type === 'input'),
      '`<NumberField.Input asChild>` requires one input, or a component forwarding input props and ref.',
    );
    child = children;
  } else {
    invariant(
      children == null,
      '`<NumberField.Input>` takes its value from `<NumberField>`, not children.',
    );
  }
  // Input values win over root values, which win over the asChild child's. Handlers compose
  // (child -> root -> Input) so Field and react-hook-form wiring on the root still runs.
  const { children: _childChildren, ...childProps } = child?.props ?? {};
  const native = mergeProps(mergeProps(childProps, context.rootProps), own);
  const actual = context.inputProps(native);
  // The child's props are already folded into `actual`; Slot would merge them a second time
  // and could not clear the child's own `name`/`defaultValue` (it keeps `base` when `next` is
  // undefined), so the child is cloned with the final props instead.
  return child ? cloneElement(child, actual) : <input {...actual} />;
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
  const { stepper, stepButton } = NumberField.Style({ size: context.size });
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
          className={stepButton()}
          onPointerDown={(event) => event.preventDefault()}
          onClick={(event) => {
            context.changeBy(direction, event.shiftKey);
            context.focus();
          }}
        />
      ))}
    </>
  );
  const merged = mergeProps({ 'data-number-field-stepper': '', className: stepper() }, props);
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
      className={NumberField.Style({ size: context.size }).clear()}
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
  const styles = NumberField.Style({ variant, size: resolvedSize });
  const generatedId = useId();
  const { items, leading, input, trailing } = splitByInput(children);
  const { asChild: _asChild, children: _inputChildren, ...inputOwnProps } = input.props;
  // The Input's own props win over the root's, so container state is derived from the merged
  // result rather than from the root props alone.
  const native: NativeInputProps = mergeProps(rootProps, inputOwnProps);
  const disabled = !!native.disabled;
  const readOnly = !!native.readOnly;
  const id = native.id ?? `ids-number-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);
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
  const inputProps = (native: NativeInputProps): NativeInputProps => ({
    ...native,
    id,
    ref: (node: HTMLInputElement | null) => {
      invariant(
        !node || node.tagName === 'INPUT',
        '`<NumberField.Input asChild>` must forward its ref to an input.',
      );
      inputRef.current = node;
      const cleanup = mergeRefs(native.ref)(node);
      return () => {
        inputRef.current = null;
        cleanup?.();
      };
    },
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
    className: styles.input({ className: native.className }),
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
  });
  const explicitSteppers = items.filter(
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
    rootProps,
    inputProps,
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
        className={styles.root({ className })}
        style={style}
      >
        <Adornments items={leading} className={styles.adornment()} />
        {input}
        <Adornments items={trailing} className={styles.adornment()} />
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
// Stepper and Clear are NumberField's own parts with their own sizing, so they skip the
// adornment wrapper; its button reset exists to flatten arbitrary buttons a consumer drops in.
function Adornments({ items, className }: { items: ReactNode[]; className: string }) {
  return items.map((item, index) =>
    isValidElement(item) && (item.type === NumberStepper || item.type === NumberClear) ? (
      item
    ) : (
      <span
        key={(isValidElement(item) && item.key) || index}
        data-number-field-adornment=""
        className={className}
      >
        {item}
      </span>
    ),
  );
}
export namespace NumberField {
  export type Props = NumberFieldProps;
  export type InputProps = Omit<NativeInputProps, 'type' | 'size' | 'value' | 'defaultValue'> & {
    asChild?: boolean;
    children?: ReactNode;
  };
  export type StepperProps = ComponentProps<'div'> & { asChild?: boolean };
  export type ClearProps = ComponentProps<'button'> & { asChild?: boolean; onClear?: () => void };
  export const Input = NumberInput;
  export const Stepper = NumberStepper;
  export const Clear = NumberClear;
  export const Style = tv({
    slots: {
      root: [
        'inline-flex w-full min-w-0 items-center',
        'bg-transparent text-(--ids-color-on-surface)',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast)',
        'motion-reduce:transition-none',
        // The ring keys off the input alone so tabbing onto a stepper or clear button
        // rings only that button, not the whole shell as well.
        'has-[[data-number-field-input]:focus-visible]:ring-[3px]',
        'has-[[data-number-field-input]:focus-visible]:ring-(--ids-color-primary)/40',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
      ],
      input: [
        'h-full w-full min-w-0 flex-1 border-0 bg-transparent outline-none',
        'text-inherit placeholder:text-(--ids-color-on-muted)',
        'selection:bg-(--ids-color-primary)/30 selection:text-(--ids-color-on-surface)',
        'disabled:cursor-not-allowed',
      ],
      adornment: [
        'inline-flex shrink-0 items-center empty:hidden',
        'not-has-[button]:text-(--ids-color-on-muted)',
        'not-has-[button]:[&_svg]:shrink-0 not-has-[button]:[&_svg]:text-current',
        '[&_button]:size-auto [&_button]:h-auto [&_button]:min-h-0 [&_button]:w-auto [&_button]:min-w-0',
        '[&_button]:p-0',
      ],
      stepper: 'flex shrink-0 flex-col',
      stepButton: 'min-w-0 p-0 [&_svg]:size-3',
      clear: 'min-w-0 p-0',
    },
    variants: {
      variant: {
        outline: {
          root: [
            'shadow-xs inset-ring-1 inset-ring-(--ids-color-outline)',
            'data-invalid:inset-ring-(--ids-color-danger)',
            'data-invalid:has-[[data-number-field-input]:focus-visible]:ring-(--ids-color-danger)/40',
          ],
        },
        filled: {
          root: [
            'bg-(--ids-color-primary)/10 inset-ring-1 inset-ring-transparent',
            'has-[[data-number-field-input]:focus-visible]:bg-(--ids-color-primary)/15',
            'data-invalid:inset-ring-(--ids-color-danger)',
            'data-invalid:has-[[data-number-field-input]:focus-visible]:ring-(--ids-color-danger)/40',
          ],
        },
        unstyled: {},
      } satisfies Record<NumberFieldVariant, object>,
      size: {
        standard: {
          root: 'h-(--ids-size-control-standard) gap-2 rounded-standard px-3 text-body-b3-regular',
          adornment: [
            'gap-1',
            'not-has-[button]:text-body-b3-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-standard)',
          ],
          stepButton: 'h-4 w-6 rounded-indicator',
          clear: 'size-7 rounded-standard',
        },
        tiny: {
          root: 'h-(--ids-size-control-tiny) gap-1.5 rounded-standard px-2 text-caption-c1-regular',
          adornment: [
            'gap-0.5',
            'not-has-[button]:text-caption-c1-regular not-has-[button]:[&_svg]:size-(--ids-size-icon-tiny)',
          ],
          stepButton: 'h-3.5 w-5 rounded-indicator',
          clear: 'size-6 rounded-indicator',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
    },
  });
}
