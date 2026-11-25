'use client';

import {
  isValidElement,
  useId,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { type CalendarDate, type CalendarDateTime } from '@internationalized/date';

import { SchedulerContext } from './context';
import { useInternalNow } from './hooks/use-now';
import { useInternalSchedulerNavigation } from './hooks/use-scheduler-navigation';
import { schedulerFormat } from './lib/format';
import {
  dateOf,
  daysOf,
  DEFAULT_DAY_COUNT,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerSlot,
  type SchedulerView,
} from './lib/layout';
import { SchedulerEvent } from './parts/event';
import { SchedulerGrid } from './parts/grid';
import {
  SchedulerEventMenu,
  SchedulerSlotMenu,
  type SchedulerEventMenuPartProps,
  type SchedulerSlotMenuPartProps,
} from './parts/menus';
import { SchedulerMonth } from './parts/month';
import { SchedulerToolbar } from './parts/toolbar';
import { schedulerStyle } from './style';
import { resolveLocale, weekStartOf, type WeekDay } from '../../../internal/date-locale';
import {
  useInternalRequiredName,
  type AccessibleName,
} from '../../../internal/lib/accessible-name';
import { useInternalProviderLocale } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { validateDate } from '../calendar/lib/date';

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
    weekStartsOn?: WeekDay;
    now?: CalendarDateTime;
    onEventChange?: (event: E, change: SchedulerEventChange<E>) => void;
    onSlotSelect?: (slot: SchedulerSlot) => void;
    children?: SchedulerChild<E> | readonly SchedulerChild<E>[];
  };

type SchedulerChild<E extends SchedulerEventData> =
  ((event: E) => ReactNode) | ReactElement | null | undefined | false;

const defaultEvent = () => <SchedulerEvent />;

function propsOfPart<P>(parts: ReactNode[], type: unknown) {
  const found = parts.find((node) => isValidElement(node) && elementTypeOf(node) === type);
  return (found as ReactElement<P> | undefined)?.props;
}

function splitChildren<E extends SchedulerEventData>(children: SchedulerProps<E>['children']) {
  const list: readonly SchedulerChild<E>[] = Array.isArray(children) ? children : [children];
  const renderEvent = list.find((child) => typeof child === 'function');
  const parts = flattenFragments(list.filter((child) => typeof child !== 'function'));

  return {
    renderEvent: renderEvent ?? defaultEvent,
    eventMenu: propsOfPart<SchedulerEventMenuPartProps<E>>(parts, SchedulerEventMenu)?.children,
    slotMenu: propsOfPart<SchedulerSlotMenuPartProps>(parts, SchedulerSlotMenu)?.children,
  };
}

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
  weekStartsOn,
  now: nowProp,
  onEventChange,
  onSlotSelect,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SchedulerProps<E>) {
  [dateProp, defaultDate].forEach((date) => validateDate(date, 'Scheduler'));
  useInternalRequiredName('Scheduler', {
    'aria-label': ariaLabel,
    'aria-labelledby': props['aria-labelledby'],
  });

  const { renderEvent, eventMenu, slotMenu } = splitChildren(children);
  const providerLocale = useInternalProviderLocale();
  const resolvedLocale = resolveLocale(providerLocale);
  const weekStart = weekStartsOn ?? weekStartOf(resolvedLocale);
  const now = useInternalNow(nowProp);
  const today = now && dateOf(now);
  const generatedHintId = useId();
  const hintId = onEventChange ? `${generatedHintId}-drag-hint` : undefined;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(' ') || undefined;

  const { view, setView, dayCount, setDayCount, date, setDate } = useInternalSchedulerNavigation({
    view: viewProp,
    defaultView,
    onViewChange,
    dayCount: dayCountProp,
    defaultDayCount,
    onDayCountChange,
    date: dateProp,
    defaultDate,
    onDateChange,
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
            renderEvent={renderEvent}
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
            renderEvent={renderEvent}
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
