'use client';

import {
  isValidElement,
  useId,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { SchedulerContext } from './context';
import { useScheduler, type SchedulerInstance } from './hooks/use-scheduler';
import { schedulerFormat } from './lib/format';
import { dateOf, daysOf, type SchedulerEventData } from './lib/layout';
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
import { resolveLocale, weekStartOf } from '../../../internal/date-locale';
import {
  useInternalRequiredName,
  type AccessibleName,
} from '../../../internal/lib/accessible-name';
import { useInternalProviderLocale } from '../../../internal/translate';
import { elementTypeOf, flattenFragments } from '../../../utils';

export type SchedulerProps<E extends SchedulerEventData = SchedulerEventData> = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue'
> &
  AccessibleName & {
    events: readonly E[];
    scheduler?: SchedulerInstance<E>;
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

export function SchedulerRoot<E extends SchedulerEventData>(props: SchedulerProps<E>) {
  if (props.scheduler) {
    return <SchedulerBoard {...props} scheduler={props.scheduler} />;
  }

  return <SchedulerWithItsOwnHook {...props} />;
}

function SchedulerWithItsOwnHook<E extends SchedulerEventData>(props: SchedulerProps<E>) {
  const scheduler = useScheduler<E>();

  return <SchedulerBoard {...props} scheduler={scheduler} />;
}

function SchedulerBoard<E extends SchedulerEventData>({
  events,
  scheduler,
  children,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SchedulerProps<E> & { scheduler: SchedulerInstance<E> }) {
  const { view, setView, dayCount, setDayCount, date, setDate, now, onEventChange, onSlotSelect } =
    scheduler;

  useInternalRequiredName('Scheduler', {
    'aria-label': ariaLabel,
    'aria-labelledby': props['aria-labelledby'],
  });

  const { renderEvent, eventMenu, slotMenu } = splitChildren(children);
  const providerLocale = useInternalProviderLocale();
  const resolvedLocale = resolveLocale(providerLocale);
  const weekStart = scheduler.weekStartsOn ?? weekStartOf(resolvedLocale);
  const today = now && dateOf(now);
  const generatedHintId = useId();
  const hintId = onEventChange ? `${generatedHintId}-drag-hint` : undefined;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(' ') || undefined;

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
