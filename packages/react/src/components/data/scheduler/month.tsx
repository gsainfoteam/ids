'use client';

import { type CSSProperties, type ReactNode } from 'react';

import { type CalendarDate } from '@internationalized/date';

import { SchedulerEventContext, type SchedulerContextValue } from './context';
import { SchedulerContextMenu } from './context-menu';
import {
  hiddenOn,
  monthBarsIn,
  weeksIn,
  type SchedulerEventData,
  type SchedulerMonthBar,
  type SchedulerSlot,
} from './layout';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';
import { ScrollArea } from '../../layout/scroll-area';
import { sameDay } from '../calendar/date';
import { ItemGroup } from '../item-group';

const SHOWN_ROWS = 3;

type SchedulerMonthProps<E extends SchedulerEventData> = SchedulerContextValue & {
  days: CalendarDate[];
  month: CalendarDate;
  events: readonly E[];
  today: CalendarDate | undefined;
  renderEvent: (event: E) => ReactNode;
  eventMenu: ((event: E) => ReactNode) | undefined;
  slotMenu: ((slot: SchedulerSlot) => ReactNode) | undefined;
  onShowDay: (day: CalendarDate) => void;
};

const barPlace = (bar: SchedulerMonthBar) =>
  ({
    '--scheduler-bar-column': bar.column + 1,
    '--scheduler-bar-span': bar.span,
    '--scheduler-bar-row': bar.row + 1,
  }) as CSSProperties;

export function SchedulerMonth<E extends SchedulerEventData>({
  styles,
  format,
  days,
  month,
  events,
  today,
  renderEvent,
  eventMenu,
  slotMenu,
  onShowDay,
}: SchedulerMonthProps<E>) {
  const t = useTranslate();
  const weeks = weeksIn(days);

  return (
    <ScrollArea className={styles.board()}>
      <ScrollArea.Viewport className={styles.viewport()}>
        <SchedulerContextMenu
          events={events}
          format={format}
          eventMenu={eventMenu}
          slotMenu={slotMenu}
        >
          <div className={styles.monthCanvas()}>
            <div aria-hidden="true" className={styles.monthHead()}>
              {weeks[0].map((day) => (
                <div key={day.toString()} className={styles.monthWeekday()}>
                  {format.weekday(day)}
                </div>
              ))}
            </div>

            {weeks.map((week) => {
              const bars = monthBarsIn(events, week);
              return (
                <div
                  key={week[0].toString()}
                  role="group"
                  aria-label={format.dates(week[0], week[week.length - 1])}
                  className={styles.monthWeek()}
                >
                  {week.map((day, column) => {
                    const isToday = today !== undefined && sameDay(day, today);
                    const outside = day.month !== month.month;
                    return (
                      <div
                        key={day.toString()}
                        aria-hidden="true"
                        data-scheduler-month-day={day.toString()}
                        aria-current={isToday ? 'date' : undefined}
                        className={styles.monthDay({ outside })}
                        style={{ '--scheduler-cell-column': column + 1 } as CSSProperties}
                      >
                        <span className={styles.monthDate({ outside, today: isToday })}>
                          {format.dayNumber(day)}
                        </span>
                      </div>
                    );
                  })}

                  <ItemGroup variant="ghost" className={styles.monthList()}>
                    {bars
                      .filter((bar) => bar.row < SHOWN_ROWS)
                      .map((bar) => (
                        <li
                          key={bar.event.id}
                          data-scheduler-slot={bar.event.id}
                          className={styles.allDayBar()}
                          style={barPlace(bar)}
                        >
                          <SchedulerEventContext
                            value={{
                              event: bar.event,
                              start: bar.start,
                              end: bar.end,
                              allDay: bar.allDay,
                              inMonth: true,
                            }}
                          >
                            {renderEvent(bar.event)}
                          </SchedulerEventContext>
                        </li>
                      ))}
                    {week.map((day, column) => {
                      const hidden = hiddenOn(bars, column, SHOWN_ROWS);
                      if (hidden === 0) return null;
                      return (
                        <li
                          key={`more-${day.toString()}`}
                          className={styles.monthMore()}
                          style={
                            {
                              '--scheduler-bar-column': column + 1,
                              '--scheduler-bar-row': SHOWN_ROWS + 1,
                            } as CSSProperties
                          }
                        >
                          <Button
                            variant="ghost"
                            size="tiny"
                            aria-label={t('scheduler.moreLabel', {
                              count: hidden,
                              date: format.fullDate(day),
                            })}
                            onClick={() => onShowDay(day)}
                          >
                            {t('scheduler.more', { count: hidden })}
                          </Button>
                        </li>
                      );
                    })}
                  </ItemGroup>
                </div>
              );
            })}
          </div>
        </SchedulerContextMenu>
      </ScrollArea.Viewport>
    </ScrollArea>
  );
}
