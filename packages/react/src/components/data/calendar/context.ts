'use client';

import { createContext, use, type ComponentProps, type Ref } from 'react';

import { invariant } from '../../../utils';

import type { CalendarOptions } from '.';
import type { calendarStyle } from './style';
import type { CalendarState } from './use-calendar';
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
  modifierNames: string[];
  renderDay?: CalendarOptions['renderDay'];
};

export const CalendarContext = createContext<ContextValue | null>(null);

export function useCalendarContext(part: string) {
  const context = use(CalendarContext);
  invariant(context, `${part} must be inside Calendar.`);
  return context;
}
