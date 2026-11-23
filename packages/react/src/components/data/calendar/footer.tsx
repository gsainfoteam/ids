'use client';

import { type ComponentProps } from 'react';

import { useCalendarContext } from './context';
import { mergeProps, part } from '../../../utils';

export type CalendarFooterProps = ComponentProps<'div'> & { asChild?: boolean };

export function CalendarFooter({ asChild, children, className, ...props }: CalendarFooterProps) {
  const c = useCalendarContext('Calendar.Footer');

  return part(
    'div',
    asChild,
    children,
    mergeProps(
      { role: 'status', 'aria-live': 'polite', className: c.styles.footer({ className }) },
      props,
    ),
  );
}

CalendarFooter.displayName = 'Calendar.Footer';
