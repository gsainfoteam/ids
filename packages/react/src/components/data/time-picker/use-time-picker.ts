import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { clamp, debounce, type DebouncedFunction } from 'es-toolkit';

import {
  nearestSlot,
  resolveHourCycle,
  sameTime,
  secondsOf,
  timeOfSeconds,
  timeSlots,
  typeaheadMatch,
  unitLabel,
  unitNumbers,
  unitTarget,
  unitValue,
  validateTime,
  type HourCycle,
  type TimePrecision,
  type TimeUnit,
} from './time';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { keyHandler, withModifiers } from '../../../internal/keys';

import type { IdsSize } from '../../../tokens/types';
import type { Time } from '@internationalized/date';

export type TimePickerState = {
  value: Time | null;
  hourCycle: HourCycle;
  precision: TimePrecision;
  step: number;
  disabled: boolean;
  readOnly: boolean;
};

export type TimePickerOptionState = {
  unit: TimeUnit;
  value: number;
  label: string;
  selected: boolean;
  active: boolean;
  disabled: boolean;
};

export type UseTimePickerOptions = {
  value: Time | null | undefined;
  defaultValue: Time | null;
  onValueChange?: (value: Time | null) => void;
  precision: TimePrecision;
  hourCycle?: HourCycle;
  step: number;
  min?: Time;
  max?: Time;
  locale: string;
  disabled: boolean;
  readOnly: boolean;
};

export function useTimePicker(options: UseTimePickerOptions) {
  const { precision, step, min, max, locale, disabled, readOnly } = options;
  validateTime(options.value);
  validateTime(options.defaultValue);
  const [value, setValue] = useControllableState<Time | null>({
    value: options.value,
    defaultValue: options.defaultValue,
    onValueChange: options.onValueChange,
  });

  const low = min && secondsOf(min);
  const high = max && secondsOf(max);
  const slots = useMemo(
    () =>
      timeSlots(
        precision,
        step,
        low === undefined ? undefined : timeOfSeconds(low),
        high === undefined ? undefined : timeOfSeconds(high),
      ),
    [precision, step, low, high],
  );
  const hourCycle = resolveHourCycle(options.hourCycle, locale);
  const current = value ? secondsOf(value) : (nearestSlot(slots, 0) ?? 0);
  const blocked = disabled || readOnly;

  const choose = (seconds: number) => {
    if (blocked) return;

    const next = timeOfSeconds(seconds);
    if (!sameTime(next, value)) setValue(next);
  };

  const clear = () => {
    if (!blocked && value) setValue(null);
  };

  const state: TimePickerState = { value, hourCycle, precision, step, disabled, readOnly };
  return { state, slots, current, locale, choose, clear };
}

export type TimePickerApi = ReturnType<typeof useTimePicker> & {
  variant: 'grid' | 'wheel';
  size: IdsSize;
};

const TYPEAHEAD_RESET = 1000;
const SETTLE_DELAY = 150;
const CONTROL_HEIGHT_STANDARD = 36;
const CONTROL_HEIGHT_TINY = 32;

export function useTimeColumn(c: TimePickerApi, unit: TimeUnit) {
  const numbers = unitNumbers(unit, c.state.hourCycle, c.state.precision, c.state.step);
  const selected = unitValue(c.current, unit, c.state.hourCycle);
  const selectedNumber = numbers.includes(selected) ? selected : numbers[0];
  const options = numbers.map((n) => ({
    n,
    seconds: unitTarget(unit, n, c.current, c.slots, c.state.hourCycle),
    label: unitLabel(unit, n, c.locale),
  }));
  const [active, setActive] = useState(selectedNumber);
  const activeNumber = numbers.includes(active) ? active : numbers[0];
  const wheel = c.variant === 'wheel';
  const node = useRef<HTMLDivElement>(null);
  const scrolling = useRef(false);
  const typed = useRef({ buffer: '', at: 0 });

  const optionHeight = () =>
    node.current?.querySelector<HTMLElement>('[data-time-option]')?.offsetHeight ||
    (c.size === 'tiny' ? CONTROL_HEIGHT_TINY : CONTROL_HEIGHT_STANDARD);
  const align = (n: number) => {
    const el = node.current;
    const target = el?.querySelector<HTMLElement>(`[data-time-option="${n}"]`);
    if (!el || !target || !el.clientHeight) return;
    const top = Math.max(0, target.offsetTop - el.clientHeight / 2 + target.offsetHeight / 2);
    if (Math.abs(el.scrollTop - top) > 1) el.scrollTop = top;
  };

  useLayoutEffect(() => {
    if (!scrolling.current) align(selectedNumber);
    const el = node.current;
    const alignWhenSized =
      el && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (!scrolling.current) align(selectedNumber);
          })
        : null;
    if (el) alignWhenSized?.observe(el);
    return () => alignWhenSized?.disconnect();
  }, [selectedNumber, wheel]);

  const moveTo = (n: number) => {
    setActive(n);
    align(n);
  };
  const commit = (n: number) => {
    const option = options.find((o) => o.n === n);
    if (option?.seconds !== undefined) c.choose(option.seconds);
  };
  const centered = () => {
    const index = Math.round((node.current?.scrollTop ?? 0) / optionHeight());
    return numbers[clamp(index, 0, numbers.length - 1)];
  };
  const scrollEndFallback = useRef<DebouncedFunction<() => void> | null>(null);
  useEffect(() => () => scrollEndFallback.current?.cancel(), []);
  const settle = () => {
    scrollEndFallback.current?.cancel();
    if (!wheel || !scrolling.current) return;
    scrolling.current = false;
    const n = centered();
    setActive(n);
    commit(n);
  };
  const latestSettle = useRef(settle);
  useLayoutEffect(() => {
    latestSettle.current = settle;
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (c.state.disabled) return;

    const index = numbers.indexOf(activeNumber);
    const column = event.currentTarget;
    const rtl =
      (getComputedStyle(column).direction || column.closest('[dir]')?.getAttribute('dir')) ===
      'rtl';

    const moveToIndex = (target: number) => () => {
      scrolling.current = false;
      moveTo(numbers[clamp(target, 0, numbers.length - 1)]);
    };

    const focusColumn = (offset: 1 | -1) => () => {
      const columns = Array.from(
        column.closest('[data-time-picker]')?.querySelectorAll<HTMLElement>('[data-time-column]') ??
          [],
      );
      columns[columns.indexOf(column) + offset]?.focus({ preventScroll: true });
    };

    const handled = keyHandler(
      withModifiers({
        ArrowUp: moveToIndex(index - 1),
        ArrowDown: moveToIndex(index + 1),
        PageUp: moveToIndex(index - 5),
        PageDown: moveToIndex(index + 5),
        Home: moveToIndex(0),
        End: moveToIndex(numbers.length - 1),
        Enter: () => {
          commit(activeNumber);
        },
        Space: () => {
          commit(activeNumber);
        },
        Delete: () => {
          c.clear();
        },
        Backspace: () => {
          c.clear();
        },
        ArrowRight: focusColumn(1),
        ArrowLeft: focusColumn(-1),
      }),
      { dir: rtl ? 'rtl' : 'ltr' },
    )(event);

    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (handled || event.defaultPrevented || !printable) return;

    const now = event.timeStamp;
    const buffer =
      (now - typed.current.at < TYPEAHEAD_RESET ? typed.current.buffer : '') + event.key;
    typed.current = { buffer, at: now };
    const labels = options.map((o) => o.label);
    const match = typeaheadMatch(labels, buffer, buffer.length > 1 ? index - 1 : index);
    if (match >= 0) {
      event.preventDefault();
      scrolling.current = false;
      moveTo(numbers[match]);
    }
  };

  const optionStates = options.map(
    ({ n, seconds, label }): TimePickerOptionState & { seconds: number | undefined } => ({
      unit,
      value: n,
      label,
      seconds,
      selected: !!c.state.value && selected === n,
      active: activeNumber === n,
      disabled: c.state.disabled || seconds === undefined,
    }),
  );

  return {
    node,
    wheel,
    options: optionStates,
    activeNumber,
    onKeyDown,
    onFocus: () => {
      setActive(selectedNumber);
      if (!scrolling.current) align(selectedNumber);
    },
    onOptionClick: (n: number) => {
      scrolling.current = false;
      node.current?.focus({ preventScroll: true });
      moveTo(n);
      commit(n);
    },
    onScrollStart: () => {
      scrolling.current = true;
    },
    onScroll: () => {
      if (!wheel || !scrolling.current) return;
      setActive(centered());
      scrollEndFallback.current ??= debounce(() => latestSettle.current(), SETTLE_DELAY);
      scrollEndFallback.current();
    },
    onScrollEnd: settle,
  };
}
