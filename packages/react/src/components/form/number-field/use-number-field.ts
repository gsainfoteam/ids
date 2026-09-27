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

import { createNumberFormat } from './number-format';
import {
  addDecimal,
  clampNumber,
  clampToStep,
  isOnStep,
  shiftDecimal,
  snapToStep,
} from './number-step';
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
  formatOptions?: Intl.NumberFormatOptions;
  allowWheelScrub: boolean;
  disabled?: boolean;
  invalid?: boolean;
  clearable: boolean;
};

type Draft = { text: string; value: number | null; format: object };

const FIRST_REPEAT_DELAY = 400;

// Holding a stepper steps once, waits, then repeats faster and faster down to a floor.
function repeatDelay(count: number) {
  return count === 0 ? FIRST_REPEAT_DELAY : Math.max(30, Math.round(120 * 0.88 ** count));
}

// iOS number keyboards have no minus key, so a field that accepts negatives asks for the full
// keyboard there. The platform is unknown on the server, so it is read after hydration.
const noop = () => () => {};
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
  // An explicit step defines a grid, anchored at min, that typed values snap to.
  const snap = step !== undefined;
  const base = min ?? 0;

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
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
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

  // Held steppers and the wheel step again before React has rendered the last step, so they
  // read the value from here rather than from this render.
  const latestValue = useRef(current);
  useLayoutEffect(() => {
    latestValue.current = current;
  });

  const fit = (next: number) =>
    snap ? clampToStep(next, stepSize, base, min, max) : clampNumber(next, min, max);

  const accept = (text: string) => {
    const parsed = format.parse(text);
    if (!parsed) {
      setDraft(null);
      return;
    }
    setDraft({ ...parsed, format });
    setCurrent(parsed.value);
  };

  // Only a value the user typed is committed: a value set from outside is never rewritten just
  // because the field was focused and left.
  const commitDraft = () => {
    if (!draft) return;
    const parsed = format.parse(inputRef.current?.value ?? draft.text);
    const next = parsed ? parsed.value : current;
    setDraft(null);
    setCurrent(next == null ? null : fit(next));
  };

  // The native stepUp() rule: a value off the step grid first moves to the next grid value in
  // that direction; a value on the grid moves by the amount. From empty, stepping starts at zero,
  // or at the nearest bound when zero is out of range.
  const stepBy = (direction: 1 | -1, amount: number) => {
    if (locked) return false;
    const previous = latestValue.current;
    const from = previous ?? clampNumber(0, min, max);
    let next =
      previous == null && from !== 0
        ? from
        : snap && !isOnStep(from, stepSize, base)
          ? snapToStep(from, stepSize, base, direction > 0 ? 'up' : 'down')
          : addDecimal(from, direction * amount);
    if ((min !== undefined && next < min) || (max !== undefined && next > max))
      next = snap ? clampToStep(next, stepSize, base, min, max) : clampNumber(next, min, max);
    if (!Number.isFinite(next)) return false;
    setDraft(null);
    setCurrent(next);
    latestValue.current = next;
    return !Object.is(next, previous);
  };

  const jumpTo = (bound: number | undefined) => {
    if (locked || bound === undefined) return false;
    setDraft(null);
    setCurrent(bound);
    return true;
  };

  const latest = useRef({ stepBy });
  useLayoutEffect(() => {
    latest.current = { stepBy };
  });

  // Press and hold on a stepper keeps stepping. Pointer capture sends the release to the button
  // even when the pointer has slid off it.
  const repeat = useRef<{ timer: number } | null>(null);
  const pointerStep = useRef(false);
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
    if (!input || !allowWheelScrub) return;
    const onWheel = (event: WheelEvent) => {
      if (input.ownerDocument.activeElement !== input || event.ctrlKey || event.metaKey) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.deltaY === 0) return;
      // The page would scroll under the pointer otherwise, which is why this listener is not
      // passive and why the feature is opt-in.
      event.preventDefault();
      latest.current.stepBy(event.deltaY < 0 ? 1 : -1, event.shiftKey ? large : stepSize);
    };
    input.addEventListener('wheel', onWheel, { passive: false });
    return () => input.removeEventListener('wheel', onWheel);
  }, [allowWheelScrub, large, stepSize]);

  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(defaultValue);
    setDraft(null);
  });

  // Out of range is reported through native validity too, so a form refuses to submit it and
  // Field.Error can show why.
  const rangeMessage =
    current == null
      ? ''
      : min !== undefined && current < min
        ? messages.numberField.rangeUnderflow(format.format(min))
        : max !== undefined && current > max
          ? messages.numberField.rangeOverflow(format.format(max))
          : '';
  // Steppers, keys and the wheel change the value without an input event, so the enclosing
  // Field is told directly; its filled, dirty and error state follow.
  const notify = use(FieldNotifyContext);
  useLayoutEffect(() => {
    inputRef.current?.setCustomValidity(rangeMessage);
    notify?.();
  }, [rangeMessage, current, notify]);

  const appleTouch = useSyncExternalStore(noop, isAppleTouch, () => false);
  const acceptsNegative = min === undefined || min < 0;
  const acceptsFraction =
    formatOptions?.maximumFractionDigits !== 0 &&
    !(snap && Number.isInteger(stepSize) && Number.isInteger(base));
  const inputMode =
    native.inputMode ??
    (acceptsNegative && appleTouch ? 'text' : acceptsFraction ? 'decimal' : 'numeric');

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
    // The hidden input carries the name, so the form gets the plain number rather than the
    // formatted text on screen.
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
    'aria-valuetext': current == null ? undefined : format.format(current),
    'aria-invalid': ariaInvalid,
    'data-field-input': '',
    'data-number-field-input': '',
    onFocus: (event: FocusEvent<HTMLInputElement>) => {
      native.onFocus?.(event);
      setFocused(true);
      setDraft(null);
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      composing.current = false;
      commitDraft();
      setFocused(false);
      native.onBlur?.(event);
    },
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      native.onChange?.(event);
      if (event.defaultPrevented || locked) return;
      if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
        setDraft({ text: event.target.value, value: current, format });
        return;
      }
      accept(event.target.value);
    },
    onCompositionStart: (event: CompositionEvent<HTMLInputElement>) => {
      composing.current = true;
      native.onCompositionStart?.(event);
    },
    onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => {
      composing.current = false;
      if (!locked) accept(event.currentTarget.value);
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
        // Without a bound Home and End keep moving the caret.
        if (jumpTo(key === 'Home' ? min : max)) event.preventDefault();
      } else if (key === 'Enter') {
        commitDraft();
      } else if (key.length === 1 && !event.altKey && !format.allowsKey(key)) {
        event.preventDefault();
      }
    },
  };

  const stepperProps = (direction: 1 | -1) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || locked) return;
      // A mouse press keeps focus in the input so the keyboard keeps working; a tap leaves it
      // alone so the on-screen keyboard does not open.
      if (event.pointerType === 'mouse') {
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
      event.currentTarget.setPointerCapture?.(event.pointerId);
      pointerStep.current = true;
      startRepeat(direction);
    },
    onPointerUp: stopRepeat,
    onPointerCancel: stopRepeat,
    onLostPointerCapture: stopRepeat,
    onContextMenu: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
    // A click that follows a press already stepped; one without a press comes from the keyboard
    // or a screen reader and steps once.
    onClick: () => {
      if (pointerStep.current) {
        pointerStep.current = false;
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
    name: native.name,
    form: native.form,
    canIncrease: current == null || current < (max ?? Infinity),
    canDecrease: current == null || current > (min ?? -Infinity),
    state: {
      disabled,
      readOnly,
      invalid: isInvalid(ariaInvalid),
      focused: control.focused,
      filled: current != null || display !== '',
    },
  };
}
