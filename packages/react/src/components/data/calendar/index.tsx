import { CalendarCaption, type CalendarCaptionLayout, type CalendarCaptionProps } from './caption';
import {
  type CalendarSelectionMode,
  type DateMatcher as CalendarDateMatcher,
  type DateRange,
} from './date';
import { CalendarDay, type CalendarDayProps } from './day';
import { CalendarFooter, type CalendarFooterProps } from './footer';
import { CalendarRoot, type CalendarDayState, type CalendarProps } from './root';
import { calendarStyle } from './style';
import { type CalendarModifiers, type CalendarState } from './use-calendar';
import { CalendarWeekNumber, type CalendarWeekNumberProps } from './week-number';

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

export { type CalendarCaptionLayout } from './caption';
export { type CalendarDayState, type CalendarOptions, type CalendarProps } from './root';
export { CalendarPickContext } from './use-calendar';

export type { CalendarState } from './use-calendar';

export type { DateRange, CalendarSelectionMode, CalendarValue, DateMatcher } from './date';
