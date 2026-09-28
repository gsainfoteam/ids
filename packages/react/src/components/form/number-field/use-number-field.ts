import {
  isValidElement,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type ComponentProps,
  type CompositionEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { NumberFormatter, NumberParser } from '@internationalized/number';
import { clamp, noop } from 'es-toolkit';

import { predictTextAfterInput } from './number-input';
import { addDecimal, clampToStep, isOnStep, shiftDecimal, snapToStep } from './number-step';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { messages } from '../../../internal/messages';
import { isInvalid, useMergedRef, useTextControl } from '../../../internal/text-control';
import { invariant, mergeProps } from '../../../utils';
import { FieldNotifyContext } from '../field/context';

export type NumberFieldInputProps = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'color'
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'min'
  | 'max'
  | 'step'
  | 'className'
  | 'style'
>;

type NotationsNumberParserCannotRead = 'notation' | 'compactDisplay';

export type NumberFieldFormatOptions = Omit<
  Intl.NumberFormatOptions,
  NotationsNumberParserCannotRead
>;

export type UseNumberFieldOptions = {
  rootProps: NumberFieldInputProps;
  input: NumberFieldInputProps & { asChild?: boolean; children?: ReactNode };
  value?: number | null;
  defaultValue: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  smallStep?: number;
  largeStep?: number;
  locale: string;
  formatOptions?: NumberFieldFormatOptions;
  allowWheelScrub: boolean;
  disabled?: boolean;
  invalid?: boolean;
  clearable: boolean;
};

type Draft = { text: string; value: number | null; formatter: NumberFormatter };

const UNROUNDED_FORMAT: Intl.NumberFormatOptions = { maximumSignificantDigits: 21 };

const DIGIT_IN_ANY_NUMBERING_SYSTEM =
  /[\p{Nd}\u3007\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d]/u;

const FOLD_FULL_WIDTH = 'NFKC';

const FIRST_REPEAT_DELAY = 400;
const REPEAT_DELAY = 120;
const REPEAT_DELAY_SHRINK = 0.88;
const MIN_REPEAT_DELAY = 30;

function repeatDelay(count: number) {
  return count === 0
    ? FIRST_REPEAT_DELAY
    : Math.max(MIN_REPEAT_DELAY, Math.round(REPEAT_DELAY * REPEAT_DELAY_SHRINK ** count));
}

function captureReleaseOffButton(event: PointerEvent<HTMLButtonElement>) {
  event.currentTarget.setPointerCapture?.(event.pointerId);
}

const subscribeToNothing = () => noop;
const platformUnknownOnServer = () => false;
function isAppleTouch() {
  const { userAgent, platform, maxTouchPoints } = navigator;
  return /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

function assertInput(node: HTMLInputElement) {
  invariant(
    node.tagName === 'INPUT',
    '`<NumberField.Input asChild>` must forward its ref to an input.',
  );
}

export function useNumberField({
  rootProps,
  input: { asChild, children, ...own },
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  smallStep,
  largeStep,
  locale,
  formatOptions,
  allowWheelScrub,
  disabled: disabledProp,
  invalid,
  clearable,
}: UseNumberFieldOptions) {
  const stepSize = step ?? 1;
  const large = largeStep ?? shiftDecimal(stepSize, 1);
  const small = smallStep ?? shiftDecimal(stepSize, -1);
  for (const [name, candidate] of Object.entries({
    value,
    defaultValue,
    min,
    max,
    step: stepSize,
    smallStep: small,
    largeStep: large,
  })) {
    invariant(
      candidate == null || (typeof candidate === 'number' && Number.isFinite(candidate)),
      `NumberField: ${name} must be a finite number.`,
    );
  }
  invariant(min == null || max == null || min <= max, 'NumberField: min must not exceed max.');
  invariant(
    stepSize > 0 && small > 0 && large > 0,
    'NumberField: step, smallStep and largeStep must be positive.',
  );
  invariant(
    ((formatOptions as Intl.NumberFormatOptions | undefined)?.notation ?? 'standard') ===
      'standard',
    'NumberField: formatOptions.notation must be "standard"; typed text in other notations cannot be parsed.',
  );
  const snapsToStepGrid = step !== undefined;
  const stepGridBase = min ?? 0;
  const lower = min ?? -Infinity;
  const upper = max ?? Infinity;

  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const childProps =
    asChild && isValidElement<ComponentProps<'input'>>(children) ? children.props : undefined;
  const native: ComponentProps<'input'> = mergeProps(mergeProps({ ...childProps }, rootProps), own);
  const disabled = Boolean(own.disabled ?? disabledProp ?? childProps?.disabled);
  const readOnly = Boolean(native.readOnly);
  const locked = disabled || readOnly;
  const id = native.id ?? `ids-number-${generatedId}`;

  const [current, setCurrent] = useControllableState<number | null>({
    value,
    defaultValue,
    onValueChange,
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const composing = useRef(false);
  const formatOptionsByValue = JSON.stringify(formatOptions ?? null);
  const { formatter, parser } = useMemo(() => {
    const options: Intl.NumberFormatOptions = JSON.parse(formatOptionsByValue) ?? UNROUNDED_FORMAT;
    return {
      formatter: new NumberFormatter(locale, options),
      parser: new NumberParser(locale, options),
    };
  }, [locale, formatOptionsByValue]);
  const format = (next: number | null) => (next == null ? '' : formatter.format(next));
  const draftStillMeansValue =
    draft !== null && Object.is(draft.value, current) && draft.formatter === formatter;
  const display = draftStillMeansValue ? draft.text : format(current);

  const valueAheadOfRender = useRef(current);
  useLayoutEffect(() => {
    valueAheadOfRender.current = current;
  });

  const fit = (next: number) =>
    snapsToStepGrid
      ? clampToStep(next, stepSize, stepGridBase, min, max)
      : clamp(next, lower, upper);

  const read = (text: string) => {
    const noDigitYet = !DIGIT_IN_ANY_NUMBERING_SYSTEM.test(text);
    if (noDigitYet) return null;
    const parsed = parser.parse(text);
    return Number.isNaN(parsed) ? null : Object.is(parsed, -0) ? 0 : parsed;
  };

  const acceptPartialNumber = (text: string) => {
    if (!parser.isValidPartialNumber(text, min, max)) return false;
    const next = read(text);
    setDraft({ text, value: next, formatter });
    setCurrent(next);
    return true;
  };

  const commitDraft = () => {
    if (!draft) return;
    setDraft(null);
    const text = inputRef.current?.value ?? draft.text;
    const unfinishedComposition = !parser.isValidPartialNumber(text, min, max);
    if (unfinishedComposition) return;
    const next = read(text);
    setCurrent(next == null ? null : fit(next));
  };

  const stepBy = (direction: 1 | -1, amount: number) => {
    if (locked) return false;
    const previous = valueAheadOfRender.current;
    const from = previous ?? clamp(0, lower, upper);
    const startsAtNearestBound = previous == null && from !== 0;
    const offStepGrid = snapsToStepGrid && !isOnStep(from, stepSize, stepGridBase);
    let next = startsAtNearestBound
      ? from
      : offStepGrid
        ? snapToStep(from, stepSize, stepGridBase, direction > 0 ? 'up' : 'down')
        : addDecimal(from, direction * amount);
    if ((min !== undefined && next < min) || (max !== undefined && next > max))
      next = snapsToStepGrid
        ? clampToStep(next, stepSize, stepGridBase, min, max)
        : clamp(next, lower, upper);
    if (!Number.isFinite(next)) return false;
    setDraft(null);
    setCurrent(next);
    valueAheadOfRender.current = next;
    return !Object.is(next, previous);
  };

  const jumpToBound = (bound: number | undefined) => {
    if (locked || bound === undefined) return false;
    setDraft(null);
    setCurrent(bound);
    return true;
  };

  const refuses = (text: string) => locked || !parser.isValidPartialNumber(text, min, max);

  const latest = useRef({ stepBy, refuses });
  useLayoutEffect(() => {
    latest.current = { stepBy, refuses };
  });

  const repeat = useRef<{ timer: number } | null>(null);
  const pressAlreadyStepped = useRef(false);
  const stopRepeat = () => {
    if (repeat.current) window.clearTimeout(repeat.current.timer);
    repeat.current = null;
  };
  const startRepeat = (direction: 1 | -1) => {
    stopRepeat();
    if (!latest.current.stepBy(direction, stepSize)) return;
    const schedule = (count: number) => {
      repeat.current = {
        timer: window.setTimeout(() => {
          if (latest.current.stepBy(direction, stepSize)) schedule(count + 1);
          else stopRepeat();
        }, repeatDelay(count)),
      };
    };
    schedule(0);
  };
  useEffect(() => stopRepeat, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const refuseWithCaretInPlace = (event: InputEvent) => {
      if (event.isComposing || !event.cancelable) return;
      const predicted = predictTextAfterInput(
        input.value,
        input.selectionStart ?? input.value.length,
        input.selectionEnd ?? input.value.length,
        event.inputType,
        event.data ?? event.dataTransfer?.getData('text/plain') ?? null,
      );
      if (predicted != null && latest.current.refuses(predicted)) event.preventDefault();
    };
    input.addEventListener('beforeinput', refuseWithCaretInPlace);
    return () => input.removeEventListener('beforeinput', refuseWithCaretInPlace);
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !allowWheelScrub) return;
    const scrubInsteadOfScrolling = (event: WheelEvent) => {
      if (input.ownerDocument.activeElement !== input || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.deltaY === 0) return;
      event.preventDefault();
      latest.current.stepBy(event.deltaY < 0 ? 1 : -1, event.shiftKey ? large : stepSize);
    };
    input.addEventListener('wheel', scrubInsteadOfScrolling, { passive: false });
    return () => input.removeEventListener('wheel', scrubInsteadOfScrolling);
  }, [allowWheelScrub, large, stepSize]);

  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(defaultValue);
    setDraft(null);
  });

  const rangeMessage =
    current == null
      ? ''
      : min !== undefined && current < min
        ? messages.numberField.rangeUnderflow(format(min))
        : max !== undefined && current > max
          ? messages.numberField.rangeOverflow(format(max))
          : '';
  const notify = use(FieldNotifyContext);
  useLayoutEffect(() => {
    inputRef.current?.setCustomValidity(rangeMessage);
    notify?.();
  }, [rangeMessage, current, notify]);

  const numericKeypadLacksMinus = useSyncExternalStore(
    subscribeToNothing,
    isAppleTouch,
    platformUnknownOnServer,
  );
  const acceptsNegative = min === undefined || min < 0;
  const acceptsFraction =
    formatOptions?.maximumFractionDigits !== 0 &&
    !(snapsToStepGrid && Number.isInteger(stepSize) && Number.isInteger(stepGridBase));
  const inputMode =
    native.inputMode ??
    (acceptsNegative && numericKeypadLacksMinus ? 'text' : acceptsFraction ? 'decimal' : 'numeric');

  const control = useTextControl({ inputRef, disabled, readOnly, clearable });
  const ref = useMergedRef(inputRef, childProps?.ref, rootProps.ref, own.ref, assertInput);
  const outOfRange = rangeMessage !== '';
  const ariaInvalid = native['aria-invalid'] ?? invalid ?? (outOfRange || undefined);

  const inputProps = {
    ...native,
    id,
    ref,
    type: 'text',
    role: 'spinbutton',
    name: undefined,
    value: display,
    defaultValue: undefined,
    inputMode,
    autoComplete: native.autoComplete ?? 'off',
    autoCorrect: native.autoCorrect ?? 'off',
    spellCheck: native.spellCheck ?? false,
    disabled,
    'aria-valuenow': current ?? undefined,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuetext': current == null ? undefined : format(current),
    'aria-invalid': ariaInvalid,
    'data-field-input': '',
    'data-number-field-input': '',
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      composing.current = false;
      commitDraft();
      native.onBlur?.(event);
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      native.onChange?.(event);
      if (event.defaultPrevented || locked) return;
      if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
        setDraft({ text: event.target.value, value: current, formatter });
        return;
      }
      acceptPartialNumber(event.target.value);
    },
    onCompositionStart: (event: CompositionEvent<HTMLInputElement>) => {
      composing.current = true;
      native.onCompositionStart?.(event);
    },
    onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => {
      composing.current = false;
      if (!locked && !acceptPartialNumber(event.currentTarget.value.normalize(FOLD_FULL_WIDTH)))
        setDraft(null);
      native.onCompositionEnd?.(event);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      native.onKeyDown?.(event);
      if (event.defaultPrevented || locked || composing.current || event.nativeEvent.isComposing)
        return;
      control.onEscape(event);
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      const { key } = event;
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        event.preventDefault();
        stepBy(
          key === 'ArrowUp' ? 1 : -1,
          event.shiftKey ? large : event.altKey ? small : stepSize,
        );
      } else if (key === 'PageUp' || key === 'PageDown') {
        event.preventDefault();
        stepBy(key === 'PageUp' ? 1 : -1, large);
      } else if (key === 'Home' || key === 'End') {
        if (jumpToBound(key === 'Home' ? min : max)) event.preventDefault();
      } else if (key === 'Enter') {
        commitDraft();
      }
    },
  };

  const stepperProps = (direction: 1 | -1) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || locked) return;
      const focusWouldOpenOnScreenKeyboard = event.pointerType !== 'mouse';
      if (!focusWouldOpenOnScreenKeyboard) {
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
      captureReleaseOffButton(event);
      pressAlreadyStepped.current = true;
      startRepeat(direction);
    },
    onPointerUp: stopRepeat,
    onPointerCancel: stopRepeat,
    onLostPointerCapture: stopRepeat,
    onContextMenu: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
    onClick: () => {
      if (pressAlreadyStepped.current) {
        pressAlreadyStepped.current = false;
        return;
      }
      stepBy(direction, stepSize);
    },
  });

  return {
    inputProps,
    rootProps: control.rootProps,
    clear: control.clear,
    stepperProps,
    value: current,
    hiddenInputName: native.name,
    form: native.form,
    canIncrease: current == null || current < upper,
    canDecrease: current == null || current > lower,
    state: {
      disabled,
      readOnly,
      invalid: isInvalid(ariaInvalid),
      focused: control.focused,
      filled: current != null || display !== '',
    },
  };
}
