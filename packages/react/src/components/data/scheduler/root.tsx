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
  shownDayCount,
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
import { useRequiredName, type AccessibleName } from '../../../internal/accessible-name';
import { resolveLocale, weekStartOf, type WeekDay } from '../../../internal/date-locale';
import { useProviderLocale } from '../../../internal/translate';
import { validateDate } from '../calendar/date';

export type SchedulerProps<E extends SchedulerEventData = SchedulerEventData> = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue'
> &
  AccessibleName & {
    events: readonly E[];
    view?: SchedulerView;
    defaultView?: SchedulerView;
    onViewChange?: (view: SchedulerView) => void;
    dayCount?: number;
    defaultDayCount?: number;
    onDayCountChange?: (count: number) => void;
    date?: CalendarDate;
    defaultDate?: CalendarDate;
    onDateChange?: (date: CalendarDate) => void;
    locale?: string;
    weekStartsOn?: WeekDay;
    now?: CalendarDateTime;
    onEventChange?: (event: E, change: SchedulerEventChange<E>) => void;
    eventMenu?: (event: E) => ReactNode;
    slotMenu?: (slot: SchedulerSlot) => ReactNode;
    onSlotSelect?: (slot: SchedulerSlot) => void;
    children?: (event: E) => ReactNode;
  };

const defaultEvent = () => <SchedulerEvent />;

export function SchedulerRoot<E extends SchedulerEventData>({
  events,
  view: viewProp,
  defaultView = 'week',
  onViewChange,
  dayCount: dayCountProp,
  defaultDayCount = DEFAULT_DAY_COUNT,
  onDayCountChange,
  date: dateProp,
  defaultDate,
  onDateChange,
  locale,
  weekStartsOn,
  now: nowProp,
  onEventChange,
  eventMenu,
  slotMenu,
  onSlotSelect,
  children = defaultEvent,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SchedulerProps<E>) {
  [dateProp, defaultDate].forEach((date) => validateDate(date, 'Scheduler'));
  useRequiredName('Scheduler', {
    'aria-label': ariaLabel,
    'aria-labelledby': props['aria-labelledby'],
  });

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
  const [dayCountValue, setDayCount] = useControllableState({
    value: dayCountProp,
    defaultValue: defaultDayCount,
    onValueChange: onDayCountChange,
  });
  const dayCount = shownDayCount(dayCountValue);
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
        aria-label={ariaLabel}
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
          onDayCountChange={setDayCount}
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
            onSlotSelect={onSlotSelect}
            onEventChange={onEventChange}
            hintId={hintId}
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
            onSlotSelect={onSlotSelect}
            hintId={hintId}
          />
        )}
      </div>
    </SchedulerContext>
  );
}
