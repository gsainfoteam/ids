'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';

import {
  parseDate,
  toCalendarDateTime,
  type CalendarDate,
  type CalendarDateTime,
} from '@internationalized/date';
import { clamp, range } from 'es-toolkit';

import {
  SchedulerEventContext,
  type SchedulerContextValue,
  type SchedulerSlotData,
} from '../context';
import { SchedulerContextMenu } from './context-menu';
import { SchedulerDrag, type SchedulerDragProps } from './drag';
import { SchedulerMovable } from './movable';
import { SchedulerSelectable, type SchedulerPoint, type SchedulerSelection } from './selectable';
import { useInternalTranslate } from '../../../../internal/translate';
import { Divider } from '../../../layout/divider';
import { ScrollArea } from '../../../layout/scroll-area';
import { sameDay } from '../../calendar/lib/date';
import { ItemGroup } from '../../item-group';
import { useInternalSchedulerGridBody } from '../hooks/use-scheduler-grid-body';
import { measureInTheGrid } from '../lib/drag-geometry';
import {
  allDayBarsIn,
  dateOf,
  firstHourOf,
  HOURS_IN_DAY,
  hourOfDay,
  snappedRange,
  timedSegmentsOn,
  timesBetween,
  type SchedulerAllDayBar,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerSlot,
} from '../lib/layout';

const HOURS = range(24);
const WORKDAY_START_HOUR = 8;
const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

type PressedTime = { day: CalendarDate; minutes: number };

function timeFrom(target: Element, pressed: SchedulerPoint) {
  const column = target.closest<HTMLElement>('[data-scheduler-column]');
  if (!column) return null;
  const { top, height } = column.getBoundingClientRect();
  const day = parseDate(column.getAttribute('data-scheduler-column')!);
  const at = ({ y }: SchedulerPoint): PressedTime => ({
    day,
    minutes: clamp(((y - top) / height) * MINUTES_IN_DAY, 0, MINUTES_IN_DAY),
  });
  return { from: at(pressed), at };
}

type SchedulerGridProps<E extends SchedulerEventData> = SchedulerContextValue & {
  days: CalendarDate[];
  events: readonly E[];
  today: CalendarDate | undefined;
  now: CalendarDateTime | undefined;
  renderEvent: (event: E) => ReactNode;
  onEventChange: ((event: E, change: SchedulerEventChange<E>) => void) | undefined;
  eventMenu: ((event: E) => ReactNode) | undefined;
  slotMenu: ((slot: SchedulerSlot) => ReactNode) | undefined;
  onSlotSelect: ((slot: SchedulerSlot) => void) | undefined;
  hintId: string | undefined;
};

const allDayContext = ({ event, fromBefore, pastEnd }: SchedulerAllDayBar) => ({
  event,
  start: toCalendarDateTime(dateOf(event.start)),
  end: toCalendarDateTime(dateOf(event.end)),
  allDay: true,
  fromBefore,
  pastEnd,
});

export function SchedulerGrid<E extends SchedulerEventData>({
  styles,
  format,
  days,
  events,
  today,
  now,
  renderEvent,
  onEventChange,
  eventMenu,
  slotMenu,
  onSlotSelect,
  hintId,
}: SchedulerGridProps<E>) {
  const t = useInternalTranslate();
  const baseId = useId();
  const headId = (day: CalendarDate) => `${baseId}-${day.toString()}`;
  const allDayLabelId = `${baseId}-all-day`;
  const allDayBars = allDayBarsIn(events, days);
  const firstHour = Math.min(firstHourOf(events, days) ?? WORKDAY_START_HOUR, WORKDAY_START_HOUR);

  const canMove = onEventChange !== undefined;
  const { viewportRef, bodyRef, hourHeight } = useInternalSchedulerGridBody(canMove, firstHour);

  const selectionOn = (selection: SchedulerSelection<PressedTime> | null, day: CalendarDate) => {
    if (!selection || !sameDay(selection.from.day, day)) return null;
    const { first, last } = snappedRange(selection.from.minutes, selection.to.minutes);
    const slot = timesBetween(day, selection.from.minutes, selection.to.minutes);
    return (
      <div
        aria-hidden="true"
        data-scheduler-selection=""
        className={styles.selection()}
        style={
          {
            '--scheduler-selection-start': first / MINUTES_IN_HOUR,
            '--scheduler-selection-hours': (last - first) / MINUTES_IN_HOUR,
          } as CSSProperties
        }
      >
        {format.time(slot.start)} – {format.time(slot.end)}
      </div>
    );
  };

  const columns = { '--scheduler-days': days.length } as CSSProperties;

  const columnsWith = (selection: SchedulerSelection<PressedTime> | null) => (
    <>
      <div aria-hidden="true" data-scroll-area-pinned="start" className={styles.gutter()}>
        {HOURS.map((hour) => (
          <div key={hour} className={styles.hour()}>
            <span>{format.hour(hour)}</span>
          </div>
        ))}
      </div>
      {days.map((day, dayIndex) => {
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
                aria-hidden
                data-scheduler-now=""
                className={styles.now()}
                style={{ '--scheduler-now': hourOfDay(now) } as CSSProperties}
              />
            )}
            {selectionOn(selection, day)}
            {segments.length > 0 && (
              <ItemGroup variant="ghost" className={styles.dayEvents()}>
                {segments.map((segment) => {
                  const content = (
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
                  );
                  return (
                    <li
                      key={segment.event.id}
                      data-scheduler-slot={segment.event.id}
                      className={styles.slot()}
                      style={
                        {
                          '--scheduler-event-start': segment.startHour,
                          '--scheduler-event-hours': segment.hours,
                          '--scheduler-event-left': segment.left,
                          '--scheduler-event-width': segment.width,
                        } as CSSProperties
                      }
                    >
                      {canMove ? (
                        <SchedulerMovable
                          segment={segment}
                          day={day}
                          dayIndex={dayIndex}
                          dayCount={days.length}
                        >
                          {content}
                        </SchedulerMovable>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ItemGroup>
            )}
          </section>
        );
      })}
    </>
  );

  const bodyClassName = styles.columns({ className: styles.body() });
  const drags = onEventChange !== undefined || onSlotSelect !== undefined;

  const body = drags ? (
    <SchedulerSelectable<PressedTime>
      ref={bodyRef}
      className={bodyClassName}
      startAt={timeFrom}
      onSelect={
        onSlotSelect &&
        (({ from, to }) => onSlotSelect(timesBetween(from.day, from.minutes, to.minutes)))
      }
    >
      {columnsWith}
    </SchedulerSelectable>
  ) : (
    <div ref={bodyRef} className={bodyClassName}>
      {columnsWith(null)}
    </div>
  );

  return (
    <ScrollArea orientation="both" className={styles.board()} style={columns}>
      <ScrollArea.Viewport ref={viewportRef} className={styles.viewport()}>
        <SchedulerContextMenu
          events={events}
          format={format}
          eventMenu={eventMenu}
          slotMenu={slotMenu}
        >
          <div className={styles.canvas()}>
            <div data-scroll-area-pinned="top" className={styles.sticky()}>
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

              {allDayBars.length > 0 && (
                <div className={styles.columns({ className: styles.allDay() })}>
                  <div id={allDayLabelId} className={styles.allDayLabel()}>
                    {t('scheduler.allDay')}
                  </div>
                  {days.map((day, index) => (
                    <div
                      key={day.toString()}
                      aria-hidden="true"
                      className={styles.allDayCell()}
                      style={{ '--scheduler-cell-column': index + 2 } as CSSProperties}
                    />
                  ))}
                  <ItemGroup
                    variant="ghost"
                    aria-labelledby={allDayLabelId}
                    className={styles.allDayList()}
                  >
                    {allDayBars.map((bar) => (
                      <li
                        key={bar.event.id}
                        data-scheduler-slot={bar.event.id}
                        className={styles.allDayBar({
                          fromBefore: bar.fromBefore,
                          pastEnd: bar.pastEnd,
                        })}
                        style={
                          {
                            '--scheduler-bar-column': bar.column + 1,
                            '--scheduler-bar-span': bar.span,
                            '--scheduler-bar-row': bar.row + 1,
                          } as CSSProperties
                        }
                      >
                        <SchedulerEventContext value={allDayContext(bar)}>
                          {renderEvent(bar.event)}
                        </SchedulerEventContext>
                      </li>
                    ))}
                  </ItemGroup>
                </div>
              )}
            </div>

            {drags ? (
              <SchedulerDrag
                events={events}
                format={format}
                hourHeight={hourHeight}
                measure={(slot: SchedulerSlotData, element) =>
                  hourHeight === undefined ? null : measureInTheGrid(slot, element, hourHeight)
                }
                hint={t('scheduler.drag.hint')}
                bodyRef={bodyRef}
                onEventChange={
                  onEventChange as SchedulerDragProps<SchedulerSlotData>['onEventChange']
                }
              >
                {body}
              </SchedulerDrag>
            ) : (
              body
            )}
            {hintId && (
              <span id={hintId} hidden>
                {t('scheduler.drag.hint')}
              </span>
            )}
          </div>
        </SchedulerContextMenu>
      </ScrollArea.Viewport>
    </ScrollArea>
  );
}
