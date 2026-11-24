'use client';

import { createContext, use, type ComponentProps, type Ref } from 'react';

import { invariant } from '../../../utils';

import type { CalendarState } from './hooks/use-calendar';
import type { CalendarDayProps } from './parts/day';
import type { calendarStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

export type NativeProps = Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'onSelect' | 'children' | 'className' | 'style' | 'dir'
>;

type ContextValue = {
  state: CalendarState;
  size: IdsSize;
  styles: ReturnType<typeof calendarStyle>;
  native: Omit<NativeProps, 'ref'>;
  rootRef: Ref<HTMLDivElement>;
  onGridMouseLeave: () => void;
  day: CalendarDayProps | undefined;
};

export const CalendarContext = createContext<ContextValue | null>(null);

export function useInternalCalendarContext(part: string) {
  const context = use(CalendarContext);
  invariant(context, `${part} must be inside Calendar.`);
  return context;
}
