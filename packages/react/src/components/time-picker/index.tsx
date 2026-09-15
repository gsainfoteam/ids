import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from 'react';

import { invariant, mergeProps, mergeRefs } from '../../utils';
import { dateAt, dayKey } from '../calendar/date';
import { useFieldSize } from '../field/context';
import { flattenParts, part } from '../field-popup';
import {
  nearestSlot,
  periodLabel,
  resolveTimeFormat,
  secondsOf,
  timeSlots,
  validateTime,
  withTime,
  type TimeFormat,
  type TimePrecision,
  type TimeUnit,
} from './time';

import type { IdsSize } from '../../tokens/types';

export type TimePickerOptions = {
  precision?: TimePrecision;
  format?: TimeFormat;
  step?: number;
  min?: Date;
  max?: Date;
  locale?: string;
  size?: IdsSize;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: 'grid' | 'wheel';
  selectionMode?: 'single' | 'none';
};
export type TimePickerProps = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> &
  TimePickerOptions & {
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (value: Date) => void;
  };
type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type ContextValue = {
  value: Date | null;
  base: Date;
  slots: number[];
  format: TimeFormat;
  precision: TimePrecision;
  step: number;
  locale: string;
  size: IdsSize;
  disabled: boolean;
  readOnly: boolean;
  variant: 'grid' | 'wheel';
  choose: (seconds: number) => void;
};
const Context = createContext<ContextValue | null>(null);
function useTimePicker() {
  const c = useContext(Context);
  invariant(c, 'TimePicker parts must be inside TimePicker.');
  return c;
}
function TimeHeader({ asChild, children, ...props }: BoxProps) {
  useTimePicker();
  return part(
    'div',
    asChild,
    children,
    mergeProps(
      {
        className: 'flex w-full basis-full justify-around gap-2 text-sm opacity-70',
        'aria-hidden': true,
      },
      props,
    ),
  );
}
function TimeSeparator({
  asChild,
  children = ':',
  ...props
}: ComponentProps<'span'> & { asChild?: boolean }) {
  useTimePicker();
  return part(
    'span',
    asChild,
    children,
    mergeProps({ 'aria-hidden': true, className: 'self-center opacity-60' }, props),
  );
}
function unitValue(seconds: number, unit: TimeUnit, format: TimeFormat) {
  const h = Math.floor(seconds / 3600);
  return unit === 'hour'
    ? format === '12h'
      ? h % 12 || 12
      : h
    : unit === 'minute'
      ? Math.floor(seconds / 60) % 60
      : unit === 'second'
        ? seconds % 60
        : Math.floor(h / 12);
}
// part/mergeProps compose callbacks; refs below are only read by events/effects.
/* eslint-disable react-hooks/refs */
function Column({ unit, asChild, children, ...props }: BoxProps & { unit: TimeUnit }) {
  const c = useTimePicker(),
    id = useId(),
    node = useRef<HTMLDivElement>(null);
  const current = c.value
    ? secondsOf(c.value)
    : (nearestSlot(c.slots, secondsOf(c.base)) ?? secondsOf(c.base));
  const numbers =
    unit === 'period'
      ? [0, 1]
      : unit === 'hour'
        ? Array.from({ length: c.format === '12h' ? 12 : 24 }, (_, i) =>
            c.format === '12h' ? i + 1 : i,
          )
        : Array.from(
            { length: Math.ceil(60 / (unit === c.precision ? c.step : 1)) },
            (_, i) => i * (unit === c.precision ? c.step : 1),
          );
  const options = numbers.map((n) => {
    const hour = Math.floor(current / 3600),
      minute = Math.floor(current / 60) % 60;
    const targetHour =
      unit === 'period'
        ? (hour % 12) + n * 12
        : unit === 'hour'
          ? c.format === '12h'
            ? (n % 12) + Math.floor(hour / 12) * 12
            : n
          : hour;
    const target =
      unit === 'minute'
        ? hour * 3600 + n * 60 + (current % 60)
        : unit === 'second'
          ? hour * 3600 + minute * 60 + n
          : targetHour * 3600 + (current % 3600);
    const matches = c.slots.filter(
      (s) =>
        (unit === 'period' ? Math.floor(s / 43200) === n : Math.floor(s / 3600) === targetHour) &&
        ((unit !== 'minute' && unit !== 'second') ||
          Math.floor(s / 60) % 60 === (unit === 'minute' ? n : minute)) &&
        (unit !== 'second' || s % 60 === n),
    );
    return { n, seconds: nearestSlot(matches, target) };
  });
  const selected = unitValue(current, unit, c.format);
  const [active, setActive] = useState(selected);
  const activeNumber = numbers.includes(active) ? active : numbers[0];
  const selectedNumber = numbers.includes(selected) ? selected : numbers[0];
  const wheel = c.variant === 'wheel',
    cell = c.size === 'tiny' ? 28 : 36;
  const scrolling = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const align = (n: number) => {
    const el = node.current,
      target = el?.querySelector<HTMLElement>(`[data-time-option="${n}"]`);
    if (!el || !target || !el.clientHeight) return;
    // Options and their positioned column share an offset parent coordinate system.
    const top = Math.max(0, target.offsetTop - el.clientHeight / 2 + target.offsetHeight / 2);
    if (Math.abs(el.scrollTop - top) > 1) el.scrollTop = top;
  };
  useLayoutEffect(() => {
    if (!scrolling.current) align(selectedNumber);
    const el = node.current;
    // A column can mount inside a hidden native popover. Align after it becomes visible.
    const observer =
      el && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (!scrolling.current) align(selectedNumber);
          })
        : null;
    if (el) observer?.observe(el);
    return () => observer?.disconnect();
  }, [selectedNumber, wheel, cell]);
  useEffect(() => () => clearTimeout(settleTimer.current), []);
  const focusOption = (n: number) => {
    setActive(n);
    align(n);
  };
  const choose = (n: number) => {
    const option = options.find((o) => o.n === n);
    if (option?.seconds !== undefined) c.choose(option.seconds);
  };
  const centeredNumber = () => {
    const el = node.current;
    return numbers[
      Math.max(0, Math.min(numbers.length - 1, Math.round((el?.scrollTop ?? 0) / cell)))
    ];
  };
  const finishScroll = () => {
    clearTimeout(settleTimer.current);
    if (!wheel || !scrolling.current) return;
    scrolling.current = false;
    const n = centeredNumber();
    setActive(n);
    choose(n);
  };
  const latestFinish = useRef(finishScroll);
  useLayoutEffect(() => {
    latestFinish.current = finishScroll;
  });
  const label =
    props['aria-label'] ??
    (unit === 'period'
      ? 'AM/PM'
      : unit === 'hour'
        ? 'Hour'
        : unit === 'minute'
          ? 'Minute'
          : 'Second');
  return part(
    'div',
    asChild,
    children ??
      options.map(({ n, seconds }) => (
        <div
          key={n}
          id={`${id}-${n}`}
          role="option"
          aria-selected={!!c.value && selected === n}
          aria-disabled={c.disabled || seconds === undefined}
          data-time-option={n}
          onClick={() => {
            scrolling.current = false;
            node.current?.focus({ preventScroll: true });
            focusOption(n);
            choose(n);
          }}
          className={`flex shrink-0 snap-center items-center justify-center rounded-md px-2 tabular-nums select-none ${c.size === 'tiny' ? 'text-sm' : 'text-base'} ${c.value && selected === n ? 'bg-(--ids-color-primary) text-(--ids-color-on-primary)' : 'hover:bg-(--ids-color-primary)/10'} ${activeNumber === n ? 'outline-offset-[-2px] group-focus-visible:outline-2 group-focus-visible:outline-(--ids-color-primary)' : ''} ${c.disabled || seconds === undefined ? 'cursor-not-allowed opacity-35' : 'cursor-pointer'}`}
          style={{ height: cell, scrollSnapAlign: 'center' }}
        >
          {unit === 'period'
            ? periodLabel(n, c.locale)
            : new Intl.NumberFormat(c.locale, {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }).format(n)}
        </div>
      )),
    mergeProps(props, {
      ref: mergeRefs(node, props.ref),
      role: 'listbox',
      'aria-label': label,
      'aria-orientation': 'vertical',
      'aria-disabled': c.disabled,
      'aria-readonly': c.readOnly,
      'aria-activedescendant': `${id}-${activeNumber}`,
      tabIndex: c.disabled ? -1 : 0,
      'data-time-column': unit,
      className: `group relative min-w-12 flex-1 overflow-y-auto overscroll-contain rounded-lg border border-(--ids-color-outline) focus-visible:outline-2 focus-visible:outline-(--ids-color-primary) ${wheel ? 'snap-y snap-mandatory [overflow-anchor:none]' : ''}`,
      style: {
        height: cell * 5,
        paddingBlock: wheel ? cell * 2 : 0,
        scrollBehavior: 'auto',
        ...props.style,
      },
      onFocus: () => {
        setActive(selectedNumber);
        if (!scrolling.current) align(selectedNumber);
      },
      onPointerDown: () => {
        scrolling.current = true;
      },
      onWheel: () => {
        scrolling.current = true;
      },
      onScroll: () => {
        if (!wheel || !scrolling.current) return;
        setActive(centeredNumber());
        clearTimeout(settleTimer.current);
        // Safari/embedded engines may omit scrollend at a boundary. Restart on every
        // momentum event so selection is committed once the column actually rests.
        settleTimer.current = setTimeout(() => latestFinish.current(), 150);
      },
      onScrollEnd: finishScroll,
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.defaultPrevented || c.disabled) return;
        const index = numbers.indexOf(activeNumber);
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          scrolling.current = false;
          const next =
            e.key === 'Home'
              ? 0
              : e.key === 'End'
                ? numbers.length - 1
                : index +
                  (e.key === 'ArrowUp'
                    ? -1
                    : e.key === 'ArrowDown'
                      ? 1
                      : e.key === 'PageUp'
                        ? -5
                        : 5);
          focusOption(numbers[Math.max(0, Math.min(numbers.length - 1, next))]);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose(activeNumber);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const columns = Array.from(
            node.current
              ?.closest('[data-time-picker]')
              ?.querySelectorAll<HTMLElement>('[data-time-column]') ?? [],
          );
          columns[columns.indexOf(node.current!) + (e.key === 'ArrowRight' ? 1 : -1)]?.focus({
            preventScroll: true,
          });
        }
      },
    }),
  );
}
/* eslint-enable react-hooks/refs */
function TimeColumn(props: TimePicker.ColumnProps) {
  return <Column {...props} />;
}
function TimePeriod(props: BoxProps) {
  return <Column {...props} unit="period" />;
}
export function TimePicker({
  value,
  defaultValue = null,
  onChange,
  precision = 'minute',
  format,
  step = 1,
  min,
  max,
  locale = 'en-US',
  size,
  disabled = false,
  readOnly = false,
  selectionMode = 'single',
  variant = 'grid',
  children,
  ...props
}: TimePickerProps) {
  validateTime(value);
  validateTime(defaultValue);
  const [stored, setStored] = useState(defaultValue);
  const current = value === undefined ? stored : value;
  const base = current ?? new Date(2000, 0, 1);
  const day = dayKey(base),
    low = min?.getTime(),
    high = max?.getTime();
  const slots = useMemo(() => {
    const [year, month, date] = day.split('-').map(Number);
    return timeSlots(
      dateAt(year, month - 1, date),
      precision,
      step,
      low === undefined ? undefined : new Date(low),
      high === undefined ? undefined : new Date(high),
    );
  }, [day, precision, step, low, high]);
  const resolvedFormat = resolveTimeFormat(format, locale),
    resolvedSize = useFieldSize(size) ?? 'standard';
  const parts = flattenParts(children),
    units: string[] = [];
  for (const child of parts)
    if (
      isValidElement<{ unit?: string }>(child) &&
      (child.type === TimeColumn || child.type === TimePeriod)
    ) {
      const unit = child.type === TimePeriod ? 'period' : child.props.unit!;
      invariant(!units.includes(unit), 'TimePicker: duplicate Column unit.');
      invariant(
        unit !== 'period' || resolvedFormat === '12h',
        'TimePicker: Period requires 12h format.',
      );
      invariant(
        unit !== 'second' || precision === 'second',
        'TimePicker: Second requires second precision.',
      );
      invariant(
        unit !== 'minute' || precision !== 'hour',
        'TimePicker: Minute requires minute/second precision.',
      );
      units.push(unit);
    }
  return (
    <Context.Provider
      value={{
        value: current,
        base,
        slots,
        format: resolvedFormat,
        precision,
        step,
        locale,
        size: resolvedSize,
        disabled,
        readOnly: readOnly || selectionMode === 'none',
        variant,
        choose: (s) => {
          if (disabled || readOnly || selectionMode === 'none') return;
          const next = withTime(base, s);
          if (!next) return;
          if (value === undefined) setStored(next);
          onChange?.(new Date(next));
        },
      }}
    >
      <div
        {...props}
        role="group"
        aria-label={props['aria-label'] ?? 'Time picker'}
        data-time-picker=""
        data-variant={variant}
        className={`flex min-w-0 flex-wrap gap-2 text-(--ids-color-on-surface) ${props.className ?? ''}`}
      >
        {children ?? (
          <>
            <TimeColumn unit="hour" />
            {precision !== 'hour' && <TimeColumn unit="minute" />}
            {precision === 'second' && <TimeColumn unit="second" />}
            {resolvedFormat === '12h' && <TimePeriod />}
          </>
        )}
      </div>
    </Context.Provider>
  );
}
export namespace TimePicker {
  export type Props = TimePickerProps;
  export type ColumnProps = BoxProps & { unit: 'hour' | 'minute' | 'second' };
  export const Column = TimeColumn,
    Period = TimePeriod,
    Header = TimeHeader,
    Separator = TimeSeparator;
}
export type { TimePrecision, TimeFormat } from './time';
