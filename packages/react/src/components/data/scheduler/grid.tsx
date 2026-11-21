'use client';

import { useId, useRef, type CSSProperties, type ReactNode } from 'react';

import {
  toCalendarDateTime,
  type CalendarDate,
  type CalendarDateTime,
} from '@internationalized/date';
import { range } from 'es-toolkit';

import { SchedulerEventContext, type SchedulerContextValue } from './context';
import {
  allDayEventsOn,
  dateOf,
  firstHourOf,
  hourOfDay,
  timedSegmentsOn,
  type SchedulerEventData,
} from './layout';
import { useFirstHourScroll } from './use-first-hour-scroll';
import { useTranslate } from '../../../internal/translate';
import { Divider } from '../../layout/divider';
import { ScrollArea } from '../../layout/scroll-area';
import { sameDay } from '../calendar/date';
import { ItemGroup } from '../item-group';

const HOURS = range(24);
const WORKDAY_START_HOUR = 8;

type SchedulerGridProps<E extends SchedulerEventData> = SchedulerContextValue & {
  days: CalendarDate[];
  events: readonly E[];
  today: CalendarDate | undefined;
  now: CalendarDateTime | undefined;
  renderEvent: (event: E) => ReactNode;
};

const allDayContext = (event: SchedulerEventData) => ({
  event,
  start: toCalendarDateTime(dateOf(event.start)),
  end: toCalendarDateTime(dateOf(event.end)),
  allDay: true,
});

export function SchedulerGrid<E extends SchedulerEventData>({
  styles,
  format,
  days,
  events,
  today,
  now,
  renderEvent,
}: SchedulerGridProps<E>) {
  const t = useTranslate();
  const baseId = useId();
  const headId = (day: CalendarDate) => `${baseId}-${day.toString()}`;
  const allDayLabelId = `${baseId}-all-day`;
  const viewportRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const allDayByDay = days.map((day) => allDayEventsOn(events, day));
  const hasAllDay = allDayByDay.some((list) => list.length > 0);
  const firstHour = Math.min(firstHourOf(events, days) ?? WORKDAY_START_HOUR, WORKDAY_START_HOUR);

  useFirstHourScroll(viewportRef, bodyRef, firstHour);

  const columns = { '--scheduler-days': days.length } as CSSProperties;

  return (
    <ScrollArea orientation="both" className={styles.board()} style={columns}>
      <ScrollArea.Viewport ref={viewportRef}>
        <div className={styles.canvas()}>
          <div className={styles.sticky()}>
            <div className={styles.columns({ className: styles.header() })}>
              <div aria-hidden="true" className={styles.corner()} />
              {days.map((day) => {
                const isToday = today !== undefined && sameDay(day, today);
                return (
                  <div
                    key={day.toString()}
                    id={headId(day)}
                    className={styles.dayHead({ today: isToday })}
                    aria-current={isToday ? 'date' : undefined}
                    data-scheduler-day={day.toString()}
                  >
                    <span aria-hidden="true">{format.weekday(day)}</span>
                    <span aria-hidden="true" className={styles.dayNumber({ today: isToday })}>
                      {format.dayNumber(day)}
                    </span>
                    <time dateTime={day.toString()} className={styles.hidden()}>
                      {format.fullDate(day)}
                    </time>
                  </div>
                );
              })}
            </div>

            {hasAllDay && (
              <div className={styles.columns({ className: styles.allDay() })}>
                <div id={allDayLabelId} className={styles.allDayLabel()}>
                  {t('scheduler.allDay')}
                </div>
                {days.map((day, index) => (
                  <div key={day.toString()} className={styles.allDayCell()}>
                    {allDayByDay[index].length > 0 && (
                      <ItemGroup
                        variant="ghost"
                        aria-labelledby={`${headId(day)} ${allDayLabelId}`}
                        className={styles.allDayList()}
                      >
                        {allDayByDay[index].map((event) => (
                          <SchedulerEventContext key={event.id} value={allDayContext(event)}>
                            {renderEvent(event)}
                          </SchedulerEventContext>
                        ))}
                      </ItemGroup>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={bodyRef} className={styles.columns({ className: styles.body() })}>
            <div aria-hidden="true" className={styles.gutter()}>
              {HOURS.map((hour) => (
                <div key={hour} className={styles.hour()}>
                  <span>{format.hour(hour)}</span>
                </div>
              ))}
            </div>
            {days.map((day) => {
              const segments = timedSegmentsOn(events, day);
              const showsNow = now !== undefined && sameDay(day, dateOf(now));
              return (
                <section
                  key={day.toString()}
                  aria-labelledby={headId(day)}
                  className={styles.day()}
                  data-scheduler-column={day.toString()}
                >
                  {showsNow && (
                    <Divider
                      decorative
                      data-scheduler-now=""
                      className={styles.now()}
                      style={{ '--scheduler-now': hourOfDay(now) } as CSSProperties}
                    />
                  )}
                  {segments.length > 0 && (
                    <ItemGroup variant="ghost" className={styles.dayEvents()}>
                      {segments.map((segment) => (
                        <li
                          key={segment.event.id}
                          className={styles.slot()}
                          style={
                            {
                              '--scheduler-event-start': segment.startHour,
                              '--scheduler-event-hours': segment.hours,
                              '--scheduler-event-lane': segment.lane,
                              '--scheduler-event-lanes': segment.lanes,
                            } as CSSProperties
                          }
                        >
                          <SchedulerEventContext
                            value={{
                              event: segment.event,
                              start: segment.start,
                              end: segment.end,
                              allDay: false,
                            }}
                          >
                            {renderEvent(segment.event)}
                          </SchedulerEventContext>
                        </li>
                      ))}
                    </ItemGroup>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </ScrollArea.Viewport>
    </ScrollArea>
  );
}
