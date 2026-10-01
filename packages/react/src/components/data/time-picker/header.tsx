'use client';

import { type ComponentProps } from 'react';

import { useTimePickerContext } from './context';
import { defaultUnits, unitMessageKey } from './units';
import { withDefault } from './with-default';
import { useTranslate } from '../../../internal/translate';
import { mergeProps, part } from '../../../utils';

export type TimePickerHeaderProps = ComponentProps<'div'> & { asChild?: boolean };

export function TimePickerHeader({ asChild, children, ...props }: TimePickerHeaderProps) {
  const t = useTranslate();
  const c = useTimePickerContext('TimePicker.Header');
  const labels = defaultUnits(c.state.precision, c.state.hourCycle, c.periodLeads).map((unit) => (
    <span key={unit} className={c.styles.headerLabel()}>
      {t(unitMessageKey[unit])}
    </span>
  ));
  return part(
    'div',
    asChild,
    asChild ? withDefault(children, labels) : (children ?? labels),
    mergeProps({ 'aria-hidden': true, className: c.styles.header() }, props),
  );
}

TimePickerHeader.displayName = 'TimePicker.Header';
