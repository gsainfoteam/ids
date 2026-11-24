'use client';

import { type ComponentProps } from 'react';

import { useInternalIntlWords } from '../../../../internal/translate';
import { mergeProps, part } from '../../../../utils';
import { useInternalTimePickerContext } from '../context';
import { defaultUnits, unitName } from '../lib/units';
import { withDefault } from '../lib/with-default';

export type TimePickerHeaderProps = ComponentProps<'div'> & { asChild?: boolean };

export function TimePickerHeader({ asChild, children, ...props }: TimePickerHeaderProps) {
  const c = useInternalTimePickerContext('TimePicker.Header');
  const words = useInternalIntlWords(c.locale);
  const labels = defaultUnits(c.state.precision, c.state.hourCycle, c.periodLeads).map((unit) => (
    <span key={unit} className={c.styles.headerLabel()}>
      {unitName(unit, words, c.locale)}
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
