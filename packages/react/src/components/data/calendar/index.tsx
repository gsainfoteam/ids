import { type CalendarModifiers, type CalendarState } from './hooks/use-calendar';
import {
  type CalendarSelectionMode,
  type DateMatcher as CalendarDateMatcher,
  type DateRange,
} from './lib/date';
import { CalendarCaption, type CalendarCaptionLayout, type CalendarCaptionProps } from './parts/caption';
import { CalendarDay, type CalendarDayProps } from './parts/day';
import { CalendarFooter, type CalendarFooterProps } from './parts/footer';
import { CalendarWeekNumber, type CalendarWeekNumberProps } from './parts/week-number';
import { CalendarRoot, type CalendarDayState, type CalendarProps } from './root';
import { calendarStyle } from './style';

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
  export type Modifiers = CalendarModifiers;
  export type DayProps = CalendarDayProps;
  export type CaptionProps = CalendarCaptionProps;
  export type WeekNumberProps = CalendarWeekNumberProps;
  export type FooterProps = CalendarFooterProps;

  export const Day = CalendarDay;
  export namespace Day {
    export type Props = CalendarDayProps;
  }

  export const Caption = CalendarCaption;
  export namespace Caption {
    export type Props = CalendarCaptionProps;
  }

  export const WeekNumber = CalendarWeekNumber;
  export namespace WeekNumber {
    export type Props = CalendarWeekNumberProps;
  }

  export const Footer = CalendarFooter;
  export namespace Footer {
    export type Props = CalendarFooterProps;
  }

  export const Style = calendarStyle;
}

export { type CalendarCaptionLayout } from './parts/caption';
export { type CalendarDayState, type CalendarOptions, type CalendarProps } from './root';
export { CalendarPickContext } from './hooks/use-calendar';

export type { CalendarState } from './hooks/use-calendar';

export type { DateRange, CalendarSelectionMode, CalendarValue, DateMatcher } from './lib/date';
