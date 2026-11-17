'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';

import {
  getLocalTimeZone,
  today as todayIn,
  type CalendarDate,
  type CalendarDateTime,
} from '@internationalized/date';

import { SchedulerContext } from './context';
import { SchedulerEvent } from './event';
import { schedulerFormat } from './format';
import { SchedulerGrid } from './grid';
import { dateOf, daysOf, type SchedulerEventData, type SchedulerView } from './layout';
import { schedulerStyle } from './style';
import { SchedulerToolbar } from './toolbar';
import { useNow } from './use-now';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { resolveLocale, weekStartOf, type WeekDay } from '../../../internal/date-locale';
import { useProviderLocale, useTranslate } from '../../../internal/translate';
import { validateDate } from '../calendar/date';

export type SchedulerProps<E extends SchedulerEventData = SchedulerEventData> = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue'
> & {
  events: readonly E[];
  view?: SchedulerView;
  defaultView?: SchedulerView;
  onViewChange?: (view: SchedulerView) => void;
  date?: CalendarDate;
  defaultDate?: CalendarDate;
  onDateChange?: (date: CalendarDate) => void;
  locale?: string;
  weekStartsOn?: WeekDay;
  now?: CalendarDateTime;
  children?: (event: E) => ReactNode;
};

const defaultEvent = () => <SchedulerEvent />;

export function SchedulerRoot<E extends SchedulerEventData>({
  events,
  view: viewProp,
  defaultView = 'week',
  onViewChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  locale,
  weekStartsOn,
  now: nowProp,
  children = defaultEvent,
  className,
  'aria-label': ariaLabel,
  ...props
}: SchedulerProps<E>) {
  [dateProp, defaultDate].forEach((date) => validateDate(date, 'Scheduler'));

  const t = useTranslate();
  const providerLocale = useProviderLocale();
  const resolvedLocale = resolveLocale(locale ?? providerLocale);
  const weekStart = weekStartsOn ?? weekStartOf(resolvedLocale);
  const now = useNow(nowProp);
  const [mountedToday] = useState(() => todayIn(getLocalTimeZone()));
  const today = nowProp ? dateOf(nowProp) : mountedToday;

  const [view, setView] = useControllableState({
    value: viewProp,
    defaultValue: defaultView,
    onValueChange: onViewChange,
  });
  const [date, setDate] = useControllableState({
    value: dateProp,
    defaultValue: defaultDate ?? today,
    onValueChange: onDateChange,
  });

  const days = daysOf(view, date, weekStart);
  const styles = schedulerStyle({ view });
  const format = schedulerFormat(resolvedLocale);

  return (
    <SchedulerContext value={{ styles, format }}>
      <div
        role="group"
        aria-label={ariaLabel ?? t('scheduler.label')}
        lang={resolvedLocale}
        {...props}
        data-scheduler=""
        data-view={view}
        className={styles.root({ className })}
      >
        <SchedulerToolbar
          styles={styles}
          format={format}
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          days={days}
          today={today}
          locale={resolvedLocale}
          weekStartsOn={weekStart}
        />
        <SchedulerGrid
          styles={styles}
          format={format}
          days={days}
          events={events}
          today={today}
          now={now}
          renderEvent={children}
        />
      </div>
    </SchedulerContext>
  );
}
