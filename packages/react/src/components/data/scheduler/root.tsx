'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';

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
import {
  dateOf,
  daysOf,
  DEFAULT_DAY_COUNT,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerSlot,
  type SchedulerView,
} from './layout';
import { SchedulerMonth } from './month';
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
  dayCount?: number;
  date?: CalendarDate;
  defaultDate?: CalendarDate;
  onDateChange?: (date: CalendarDate) => void;
  locale?: string;
  weekStartsOn?: WeekDay;
  now?: CalendarDateTime;
  onEventChange?: (event: E, change: SchedulerEventChange<E>) => void;
  eventMenu?: (event: E) => ReactNode;
  slotMenu?: (slot: SchedulerSlot) => ReactNode;
  children?: (event: E) => ReactNode;
};

const defaultEvent = () => <SchedulerEvent />;

export function SchedulerRoot<E extends SchedulerEventData>({
  events,
  view: viewProp,
  defaultView = 'week',
  onViewChange,
  dayCount = DEFAULT_DAY_COUNT,
  date: dateProp,
  defaultDate,
  onDateChange,
  locale,
  weekStartsOn,
  now: nowProp,
  onEventChange,
  eventMenu,
  slotMenu,
  children = defaultEvent,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SchedulerProps<E>) {
  [dateProp, defaultDate].forEach((date) => validateDate(date, 'Scheduler'));

  const t = useTranslate();
  const providerLocale = useProviderLocale();
  const resolvedLocale = resolveLocale(locale ?? providerLocale);
  const weekStart = weekStartsOn ?? weekStartOf(resolvedLocale);
  const now = useNow(nowProp);
  const [firstShownDate] = useState(() => defaultDate ?? todayIn(getLocalTimeZone()));
  const today = now && dateOf(now);
  const generatedHintId = useId();
  const hintId = onEventChange ? `${generatedHintId}-drag-hint` : undefined;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(' ') || undefined;

  const [view, setView] = useControllableState({
    value: viewProp,
    defaultValue: defaultView,
    onValueChange: onViewChange,
  });
  const [date, setDate] = useControllableState({
    value: dateProp,
    defaultValue: firstShownDate,
    onValueChange: onDateChange,
  });

  const days = daysOf(view, date, weekStart, dayCount);
  const styles = schedulerStyle({ view });
  const format = schedulerFormat(resolvedLocale);

  return (
    <SchedulerContext value={{ styles, format }}>
      <div
        role="group"
        aria-label={ariaLabel ?? t('scheduler.label')}
        aria-describedby={describedBy}
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
          dayCount={dayCount}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          days={days}
          today={today}
          locale={resolvedLocale}
          weekStartsOn={weekStart}
        />
        {view === 'month' ? (
          <SchedulerMonth
            styles={styles}
            format={format}
            days={days}
            month={date}
            events={events}
            today={today}
            renderEvent={children}
            eventMenu={eventMenu}
            slotMenu={slotMenu}
            onShowDay={(day) => {
              setDate(day);
              setView('day');
            }}
          />
        ) : (
          <SchedulerGrid
            styles={styles}
            format={format}
            days={days}
            events={events}
            today={today}
            now={now}
            renderEvent={children}
            onEventChange={onEventChange}
            eventMenu={eventMenu}
            slotMenu={slotMenu}
            hintId={hintId}
          />
        )}
      </div>
    </SchedulerContext>
  );
}
