import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { parseISO, startOfDay } from 'date-fns';
import { clamp, debounce, type DebouncedFunction } from 'es-toolkit';

import {
  nearestSlot,
  resolveTimeFormat,
  secondsOf,
  timeSlots,
  typeaheadMatch,
  unitLabel,
  unitNumbers,
  unitTarget,
  unitValue,
  validateTime,
  withTime,
  type TimeFormat,
  type TimePrecision,
  type TimeUnit,
} from './time';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { dayKey } from '../calendar/date';

import type { IdsSize } from '../../../tokens/types';

export type TimePickerState = {
  value: Date | null;
  format: TimeFormat;
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
  value: Date | null | undefined;
  defaultValue: Date | null;
  onValueChange?: (value: Date | null) => void;
  referenceDate?: Date;
  precision: TimePrecision;
  format?: TimeFormat;
  step: number;
  min?: Date;
  max?: Date;
  locale: string;
  disabled: boolean;
  readOnly: boolean;
};

export function useTimePicker(options: UseTimePickerOptions) {
  const { precision, step, min, max, locale, disabled, readOnly } = options;
  validateTime(options.value);
  validateTime(options.defaultValue);
  validateTime(options.referenceDate);
  const [value, setValue] = useControllableState<Date | null>({
    value: options.value,
    defaultValue: options.defaultValue,
    onValueChange: options.onValueChange,
  });
  const [mountedDay] = useState(() => startOfDay(new Date()));
  const base = value ?? (options.referenceDate ? startOfDay(options.referenceDate) : mountedDay);
  const day = dayKey(base);
  const low = min?.getTime();
  const high = max?.getTime();
  const slots = useMemo(
    () =>
      timeSlots(
        parseISO(day),
        precision,
        step,
        low === undefined ? undefined : new Date(low),
        high === undefined ? undefined : new Date(high),
      ),
    [day, precision, step, low, high],
  );
  const format = resolveTimeFormat(options.format, locale);
  const current = value
    ? secondsOf(value)
    : (nearestSlot(slots, secondsOf(base)) ?? secondsOf(base));
  const blocked = disabled || readOnly;

  const choose = (seconds: number) => {
    if (blocked) return;
    const next = withTime(base, seconds);
    if (!next || (value && next.getTime() === value.getTime())) return;
    setValue(next);
  };
  const clear = () => {
    if (!blocked && value) setValue(null);
  };

  const state: TimePickerState = { value, format, precision, step, disabled, readOnly };
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
  const numbers = unitNumbers(unit, c.state.format, c.state.precision, c.state.step);
  const selected = unitValue(c.current, unit, c.state.format);
  const selectedNumber = numbers.includes(selected) ? selected : numbers[0];
  const options = numbers.map((n) => ({
    n,
    seconds: unitTarget(unit, n, c.current, c.slots, c.state.format),
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
    if (event.defaultPrevented || c.state.disabled) return;
    const index = numbers.indexOf(activeNumber);
    const moves: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowDown: index + 1,
      PageUp: index - 5,
      PageDown: index + 5,
      Home: 0,
      End: numbers.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      scrolling.current = false;
      moveTo(numbers[clamp(moves[event.key], 0, numbers.length - 1)]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      commit(activeNumber);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      c.clear();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const el = event.currentTarget;
      const rtl =
        (getComputedStyle(el).direction || el.closest('[dir]')?.getAttribute('dir')) === 'rtl';
      const columns = Array.from(
        el.closest('[data-time-picker]')?.querySelectorAll<HTMLElement>('[data-time-column]') ?? [],
      );
      const forward = (event.key === 'ArrowRight') !== rtl;
      columns[columns.indexOf(el) + (forward ? 1 : -1)]?.focus({ preventScroll: true });
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
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
