'use client';

import {
  isValidElement,
  useId,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

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
import {
  SchedulerEventMenu,
  SchedulerSlotMenu,
  type SchedulerEventMenuPartProps,
  type SchedulerSlotMenuPartProps,
} from './menus';
import { SchedulerMonth } from './month';
import { schedulerStyle } from './style';
import { SchedulerToolbar } from './toolbar';
import { useNow } from './use-now';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { useRequiredName, type AccessibleName } from '../../../internal/accessible-name';
import { resolveLocale, weekStartOf, type WeekDay } from '../../../internal/date-locale';
import { useProviderLocale } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';
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
  locale,
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
  useRequiredName('Scheduler', {
    'aria-label': ariaLabel,
    'aria-labelledby': props['aria-labelledby'],
  });

  const { renderEvent, eventMenu, slotMenu } = splitChildren(children);
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
