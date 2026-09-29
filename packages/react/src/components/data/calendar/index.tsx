import {
  type CalendarSelectionMode,
  type DateMatcher as CalendarDateMatcher,
  type DateRange,
} from './date';
import {
  CalendarRoot,
  type CalendarCaptionLayout,
  type CalendarDayState,
  type CalendarProps,
} from './root';
import { calendarStyle } from './style';
import { type CalendarState } from './use-calendar';

export function Calendar(props: CalendarProps) {
  return <CalendarRoot {...props} />;
}

export namespace Calendar {
  export type Props = CalendarProps;
  export type State = CalendarState;
  export type Range = DateRange;
  export type SelectionMode = CalendarSelectionMode;
  export type CaptionLayout = CalendarCaptionLayout;
  export type DateMatcher = CalendarDateMatcher;
  export type DayState = CalendarDayState;

  export const Style = calendarStyle;
}

export {
  type CalendarCaptionLayout,
  type CalendarDayState,
  type CalendarOptions,
  type CalendarProps,
} from './root';
export { CalendarPickContext } from './use-calendar';

export type { CalendarState } from './use-calendar';

export type { DateRange, CalendarSelectionMode, CalendarValue, DateMatcher } from './date';
