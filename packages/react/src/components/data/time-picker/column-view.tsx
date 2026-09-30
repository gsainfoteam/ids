'use client';

import { useId } from 'react';

import { useTimePickerContext } from './context';
import { unitMessageKey } from './units';
import { useTimeColumn } from './use-time-picker';
import { withDefault } from './with-default';
import { useTranslate } from '../../../internal/translate';
import { mergeProps, part } from '../../../utils';
import { ScrollArea } from '../../layout/scroll-area';

import type { TimePickerColumnProps } from './column';
import type { TimeUnit } from './time';

export function ColumnView({
  unit,
  asChild,
  children,
  ...props
}: Omit<TimePickerColumnProps, 'unit'> & { unit: TimeUnit }) {
  const t = useTranslate();
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
  const listbox = part(
    'div',
    asChild,
    asChild && typeof children !== 'function' ? withDefault(children, options) : options,
    mergeProps(props, {
      ref: column.node,
      role: 'listbox',
      'aria-label': props['aria-label'] ?? t(unitMessageKey[unit]),
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

  return (
    <ScrollArea size="tiny" fade="y" className={c.styles.columnArea()}>
      <ScrollArea.Viewport asChild>{listbox}</ScrollArea.Viewport>
    </ScrollArea>
  );
}
