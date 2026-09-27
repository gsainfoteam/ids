import {
  cloneElement,
  createContext,
  isValidElement,
  use,
  useId,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  useTimeColumn,
  useTimePicker,
  type TimePickerApi,
  type TimePickerOptionState,
  type TimePickerState,
} from './use-time-picker';
import { periodFirst, resolveLocale, type DateLocale } from '../../../internal/date-locale';
import { flattenParts, part } from '../../../internal/field-popup';
import { messages } from '../../../internal/messages';
import { invariant, mergeProps, mergeRefs, tv } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { TimeFormat, TimePrecision, TimeUnit } from './time';
import type { IdsSize } from '../../../tokens/types';

export type TimePickerVariant = 'grid' | 'wheel';

export type TimePickerOptions = {
  precision?: TimePrecision;
  format?: TimeFormat;
  step?: number;
  min?: Date;
  max?: Date;
  locale?: DateLocale;
  size?: IdsSize;
  disabled?: boolean;
  readOnly?: boolean;
  variant?: TimePickerVariant;
  selectionMode?: 'single' | 'none';
};

export type TimePickerProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'className' | 'style'
> &
  TimePickerOptions & {
    value?: Date | null;
    defaultValue?: Date | null;
    onValueChange?: (value: Date | null) => void;
    referenceDate?: Date;
    className?: string | ((state: TimePickerState) => string | undefined);
    style?: CSSProperties | ((state: TimePickerState) => CSSProperties | undefined);
  };

type BoxProps = ComponentProps<'div'> & { asChild?: boolean };
type ContextValue = TimePickerApi & {
  styles: ReturnType<typeof TimePicker.Style>;
  periodLeads: boolean;
};

const TimePickerContext = createContext<ContextValue | null>(null);

function useTimePickerContext(part: string) {
  const context = use(TimePickerContext);
  invariant(context, `${part} must be inside TimePicker.`);
  return context;
}

const unitMessage: Record<TimeUnit, string> = {
  hour: messages.timePicker.hour,
  minute: messages.timePicker.minute,
  second: messages.timePicker.second,
  period: messages.timePicker.period,
};

function withDefault(children: ReactNode, fallback: ReactNode) {
  return isValidElement<{ children?: ReactNode }>(children) && children.props.children == null
    ? cloneElement(children, undefined, fallback)
    : children;
}

function defaultUnits(
  precision: TimePrecision,
  format: TimeFormat,
  periodLeads: boolean,
): TimeUnit[] {
  const clock: TimeUnit[] = [
    'hour',
    ...(precision !== 'hour' ? (['minute'] as const) : []),
    ...(precision === 'second' ? (['second'] as const) : []),
  ];
  if (format !== '12h') return clock;
  return periodLeads ? ['period', ...clock] : [...clock, 'period'];
}

export function TimePicker({
  value,
  defaultValue = null,
  onValueChange,
  referenceDate,
  precision = 'minute',
  format,
  step = 1,
  min,
  max,
  locale,
  size,
  disabled = false,
  readOnly = false,
  selectionMode = 'single',
  variant = 'grid',
  className,
  style,
  children,
  ...props
}: TimePickerProps) {
  const api = useTimePicker({
    value,
    defaultValue,
    onValueChange,
    referenceDate,
    precision,
    format,
    step,
    min,
    max,
    locale: resolveLocale(locale),
    disabled,
    readOnly: readOnly || selectionMode === 'none',
  });
  const { state } = api;
  const periodLeads = periodFirst(resolveLocale(locale));
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = TimePicker.Style({ size: resolvedSize });

  const units: string[] = [];
  for (const child of flattenParts(children)) {
    if (!isValidElement<{ unit?: TimeUnit }>(child)) continue;
    if (child.type !== TimePicker.Column && child.type !== TimePicker.Period) continue;
    const unit = child.type === TimePicker.Period ? 'period' : child.props.unit!;
    invariant(!units.includes(unit), 'TimePicker: duplicate Column unit.');
    invariant(
      unit !== 'period' || state.format === '12h',
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
    <TimePickerContext.Provider
      value={{ ...api, variant, size: resolvedSize, styles, periodLeads }}
    >
      <div
        {...props}
        role="group"
        aria-label={props['aria-label'] ?? messages.timePicker.label}
        aria-disabled={disabled || undefined}
        data-time-picker=""
        data-variant={variant}
        data-size={resolvedSize}
        data-format={state.format}
        data-disabled={disabled ? '' : undefined}
        data-readonly={state.readOnly ? '' : undefined}
        data-empty={state.value ? undefined : ''}
        className={styles.root({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
      >
        {children ??
          defaultUnits(precision, state.format, periodLeads).map((unit) =>
            unit === 'period' ? (
              <TimePicker.Period key={unit} />
            ) : (
              <TimePicker.Column key={unit} unit={unit} />
            ),
          )}
      </div>
    </TimePickerContext.Provider>
  );
}

function ColumnView({
  unit,
  asChild,
  children,
  ...props
}: Omit<TimePicker.ColumnProps, 'unit'> & { unit: TimeUnit }) {
  const c = useTimePickerContext(unit === 'period' ? 'TimePicker.Period' : 'TimePicker.Column');
  const id = useId();
  const column = useTimeColumn(c, unit);
  const options = column.options.map((option) => (
    <div
      key={option.value}
      id={`${id}-${option.value}`}
      role="option"
      aria-selected={option.selected}
      aria-disabled={option.disabled || undefined}
      data-time-option={option.value}
      data-selected={option.selected ? '' : undefined}
      data-active={option.active ? '' : undefined}
      data-disabled={option.disabled ? '' : undefined}
      onClick={() => {
        if (!option.disabled) column.onOptionClick(option.value);
      }}
      className={c.styles.option()}
    >
      {typeof children === 'function' ? children(option) : option.label}
    </div>
  ));
  return part(
    'div',
    asChild,
    asChild && typeof children !== 'function' ? withDefault(children, options) : options,
    mergeProps(props, {
      ref: mergeRefs(column.node, props.ref),
      role: 'listbox',
      'aria-label': props['aria-label'] ?? unitMessage[unit],
      'aria-orientation': 'vertical',
      'aria-disabled': c.state.disabled || undefined,
      'aria-readonly': c.state.readOnly || undefined,
      'aria-activedescendant': `${id}-${column.activeNumber}`,
      tabIndex: c.state.disabled ? -1 : 0,
      'data-time-column': unit,
      'data-variant': c.variant,
      className: c.styles.column({ className: props.className }),
      onFocus: column.onFocus,
      onPointerDown: column.onScrollStart,
      onWheel: column.onScrollStart,
      onScroll: column.onScroll,
      onScrollEnd: column.onScrollEnd,
      onKeyDown: column.onKeyDown,
    }),
  );
}

export namespace TimePicker {
  export type Props = TimePickerProps;
  export type State = TimePickerState;
  export type OptionState = TimePickerOptionState;
  export type Variant = TimePickerVariant;
  export type ColumnProps = Omit<ComponentProps<'div'>, 'children'> & {
    unit: 'hour' | 'minute' | 'second';
    asChild?: boolean;
    children?: ReactNode | ((option: OptionState) => ReactNode);
  };
  export type PeriodProps = Omit<ColumnProps, 'unit'>;
  export type SeparatorProps = ComponentProps<'span'> & { asChild?: boolean };

  export function Column(props: ColumnProps) {
    return <ColumnView {...props} />;
  }

  export function Period(props: PeriodProps) {
    return <ColumnView {...props} unit="period" />;
  }

  export function Header({ asChild, children, ...props }: BoxProps) {
    const c = useTimePickerContext('TimePicker.Header');
    const labels = defaultUnits(c.state.precision, c.state.format, c.periodLeads).map((unit) => (
      <span key={unit} className={c.styles.headerLabel()}>
        {unitMessage[unit]}
      </span>
    ));
    return part(
      'div',
      asChild,
      asChild ? withDefault(children, labels) : (children ?? labels),
      mergeProps({ 'aria-hidden': true, className: c.styles.header() }, props),
    );
  }

  export function Separator({ asChild, children = ':', ...props }: SeparatorProps) {
    const c = useTimePickerContext('TimePicker.Separator');
    return part(
      'span',
      asChild,
      children,
      mergeProps({ 'aria-hidden': true, className: c.styles.separator() }, props),
    );
  }

  export const Style = tv({
    slots: {
      root: 'flex min-w-0 flex-wrap gap-1 text-(--ids-color-on-surface)',
      header: 'flex w-full basis-full gap-1 text-(--ids-color-on-muted) select-none',
      headerLabel: 'min-w-12 flex-1 text-center',
      separator: 'self-center text-(--ids-color-on-muted) select-none',
      column: [
        'group/column relative h-(--time-picker-height) min-w-12 flex-1 overflow-y-auto overscroll-contain rounded-standard',
        'before:block before:h-[calc(50%-var(--time-option)/2)] after:block after:h-[calc(50%-var(--time-option)/2)]',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'focus-ring aria-disabled:cursor-not-allowed',
        'data-[variant=wheel]:snap-y data-[variant=wheel]:snap-mandatory data-[variant=wheel]:[overflow-anchor:none]',
      ],
      option: [
        'flex h-(--time-option) shrink-0 snap-center items-center justify-center rounded-standard px-2 tabular-nums select-none',
        'cursor-pointer transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'hover:bg-(--ids-color-muted)',
        'group-focus-visible/column:data-active:bg-(--ids-color-muted)',
        'data-selected:bg-(--ids-color-primary) data-selected:font-medium data-selected:text-(--ids-color-on-primary)',
        'data-selected:hover:bg-(--ids-color-primary)/90',
        'group-focus-visible/column:data-selected:data-active:inset-ring-2 group-focus-visible/column:data-selected:data-active:inset-ring-(--ids-color-on-primary)/60',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:bg-transparent',
      ],
    },
    variants: {
      size: {
        standard: {
          root: [
            '[--time-option:var(--ids-size-control-standard)] text-body-b3-regular',
            '[--time-picker-height:calc(var(--time-option)*5)]',
          ],
          header: 'text-caption-c1-regular',
          option: 'text-body-b3-regular',
        },
        tiny: {
          root: [
            '[--time-option:var(--ids-size-control-tiny)] text-caption-c1-regular',
            '[--time-picker-height:calc(var(--time-option)*5)]',
          ],
          header: 'text-caption-c2-regular',
          option: 'text-caption-c1-regular',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { size: 'standard' },
  });
}

export type { TimePrecision, TimeFormat } from './time';
export type { TimePickerOptionState, TimePickerState } from './use-time-picker';
