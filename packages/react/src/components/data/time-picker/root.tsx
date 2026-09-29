'use client';

import { isValidElement, type ComponentProps, type CSSProperties } from 'react';

import { TimePickerColumn } from './column';
import { TimePickerContext } from './context';
import { TimePickerPeriod } from './period';
import { timePickerStyle } from './style';
import { defaultUnits } from './units';
import { useTimePicker, type TimePickerState } from './use-time-picker';
import { periodFirst, resolveLocale } from '../../../internal/date-locale';
import { messages } from '../../../internal/messages';
import { flattenFragments, invariant } from '../../../utils';
import { useFieldSize } from '../../form/field/context';

import type { HourCycle, TimePrecision, TimeUnit } from './time';
import type { IdsSize } from '../../../tokens/types';
import type { Time } from '@internationalized/date';

export type TimePickerVariant = 'grid' | 'wheel';

export type TimePickerOptions = {
  precision?: TimePrecision;
  hourCycle?: HourCycle;
  step?: number;
  min?: Time;
  max?: Time;
  locale?: string;
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
    value?: Time | null;
    defaultValue?: Time | null;
    onValueChange?: (value: Time | null) => void;
    className?: string | ((state: TimePickerState) => string | undefined);
    style?: CSSProperties | ((state: TimePickerState) => CSSProperties | undefined);
  };

export function TimePickerRoot({
  value,
  defaultValue = null,
  onValueChange,
  precision = 'minute',
  hourCycle,
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
  const resolvedLocale = resolveLocale(locale);
  const api = useTimePicker({
    value,
    defaultValue,
    onValueChange,
    precision,
    hourCycle,
    step,
    min,
    max,
    locale: resolvedLocale,
    disabled,
    readOnly: readOnly || selectionMode === 'none',
  });
  const { state } = api;
  const periodLeads = periodFirst(resolvedLocale);
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const styles = timePickerStyle({ size: resolvedSize });

  const units: string[] = [];
  for (const child of flattenFragments(children)) {
    if (!isValidElement<{ unit?: TimeUnit }>(child)) continue;
    if (child.type !== TimePickerColumn && child.type !== TimePickerPeriod) continue;
    const unit = child.type === TimePickerPeriod ? 'period' : child.props.unit!;
    invariant(!units.includes(unit), 'TimePicker: duplicate Column unit.');
    invariant(
      unit !== 'period' || state.hourCycle === '12h',
      'TimePicker: Period requires the 12h hour cycle.',
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
        data-hour-cycle={state.hourCycle}
        data-disabled={disabled ? '' : undefined}
        data-readonly={state.readOnly ? '' : undefined}
        data-empty={state.value ? undefined : ''}
        className={styles.root({
          className: typeof className === 'function' ? className(state) : className,
        })}
        style={typeof style === 'function' ? style(state) : style}
      >
        {children ??
          defaultUnits(precision, state.hourCycle, periodLeads).map((unit) =>
            unit === 'period' ? (
              <TimePickerPeriod key={unit} />
            ) : (
              <TimePickerColumn key={unit} unit={unit} />
            ),
          )}
      </div>
    </TimePickerContext.Provider>
  );
}
