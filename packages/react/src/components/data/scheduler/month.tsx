'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';

import { type CalendarDate } from '@internationalized/date';

import {
  SchedulerEventContext,
  type SchedulerContextValue,
  type SchedulerDragPiece,
} from './context';
import { dayOfCell, SchedulerContextMenu } from './context-menu';
import { SchedulerDrag, type SchedulerDragProps } from './drag';
import { measureInTheMonth } from './drag-geometry';
import {
  daysBetween,
  hiddenOn,
  monthBarsIn,
  weeksIn,
  type SchedulerEventChange,
  type SchedulerEventData,
  type SchedulerMonthBar,
  type SchedulerSlot,
} from './layout';
import { SchedulerMonthMovable } from './month-movable';
import { SchedulerSelectable, type SchedulerPoint, type SchedulerSelection } from './selectable';
import { useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';
import { ScrollArea } from '../../layout/scroll-area';
import { compareDays, sameDay } from '../calendar/date';
import { ItemGroup } from '../item-group';

const SHOWN_ROWS = 3;
const DAYS_IN_WEEK = 7;
const MONTH_AUTO_SCROLL = { threshold: { x: 0, y: 0.08 } };
const MONTH_DAY = '[data-scheduler-month-day]';

const nearest = <T,>(places: T[], reaches: (place: T) => boolean) =>
  places.find(reaches) ?? places[places.length - 1];

function dayFrom(target: Element, pressed: SchedulerPoint) {
  const canvas = target.closest('[data-scheduler-month-canvas]');
  if (!target.closest(MONTH_DAY) || !canvas) return null;
  const weeks = [...canvas.querySelectorAll('[data-scheduler-month-week]')].map((week) => ({
    bottom: week.getBoundingClientRect().bottom,
    cells: [...week.querySelectorAll(MONTH_DAY)]
      .map((cell) => ({ day: dayOfCell(cell), rect: cell.getBoundingClientRect() }))
      .sort((a, b) => a.rect.left - b.rect.left),
  }));
  const at = ({ x, y }: SchedulerPoint) => {
    const { cells } = nearest(weeks, (week) => y < week.bottom);
    return nearest(cells, (cell) => x < cell.rect.right).day;
  };
  return { from: at(pressed), at };
}

type SchedulerMonthProps<E extends SchedulerEventData> = SchedulerContextValue & {
  days: CalendarDate[];
  month: CalendarDate;
  events: readonly E[];
  today: CalendarDate | undefined;
  renderEvent: (event: E) => ReactNode;
  eventMenu: ((event: E) => ReactNode) | undefined;
  slotMenu: ((slot: SchedulerSlot) => ReactNode) | undefined;
  onSlotSelect: ((slot: SchedulerSlot) => void) | undefined;
  onEventChange: ((event: E, change: SchedulerEventChange<E>) => void) | undefined;
  hintId: string | undefined;
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
  onSlotSelect,
  onEventChange,
  hintId,
  onShowDay,
}: SchedulerMonthProps<E>) {
  const t = useTranslate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const weeks = weeksIn(days);

  const isSelected = (selection: SchedulerSelection<CalendarDate> | null, day: CalendarDate) =>
    selection !== null && compareDays(day, selection.from) * compareDays(day, selection.to) <= 0;

  const movable = (bar: SchedulerMonthBar<E>, weekIndex: number, content: ReactNode) =>
    onEventChange ? (
      <SchedulerMonthMovable
        event={bar.event}
        dayIndex={weekIndex * DAYS_IN_WEEK + bar.column}
        dayCount={days.length}
      >
        {content}
      </SchedulerMonthMovable>
    ) : (
      content
    );

  const weeksWith = (selection: SchedulerSelection<CalendarDate> | null) => (
    <>
      <div aria-hidden="true" data-scroll-area-pinned="top" className={styles.monthHead()}>
        {weeks[0].map((day) => (
          <div key={day.toString()} className={styles.monthWeekday()}>
            {format.weekday(day)}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => {
        const bars = monthBarsIn(events, week);
        return (
          <div
            key={week[0].toString()}
            role="group"
            data-scheduler-month-week=""
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
                  data-selected={isSelected(selection, day) ? '' : undefined}
                  className={styles.monthDay({ outside, selected: isSelected(selection, day) })}
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
                    className={styles.allDayBar({
                      fromBefore: bar.fromBefore,
                      pastEnd: bar.pastEnd,
                    })}
                    style={barPlace(bar)}
                  >
                    <SchedulerEventContext
                      value={{
                        event: bar.event,
                        start: bar.start,
                        end: bar.end,
                        allDay: bar.allDay,
                        inMonth: true,
                        line: !bar.allDay && !bar.multiDay,
                        fromBefore: bar.fromBefore,
                        pastEnd: bar.pastEnd,
                      }}
                    >
                      {movable(bar, weekIndex, renderEvent(bar.event))}
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
                      {format.words.signed(hidden)}
                    </Button>
                  </li>
                );
              })}
            </ItemGroup>
          </div>
        );
      })}
    </>
  );

  const drags = onEventChange !== undefined || onSlotSelect !== undefined;

  const board = (
    <SchedulerContextMenu events={events} format={format} eventMenu={eventMenu} slotMenu={slotMenu}>
      {drags ? (
        <SchedulerSelectable<CalendarDate>
          ref={canvasRef}
          data-scheduler-month-canvas=""
          className={styles.monthCanvas()}
          startAt={dayFrom}
          onSelect={onSlotSelect && (({ from, to }) => onSlotSelect(daysBetween(from, to)))}
        >
          {weeksWith}
        </SchedulerSelectable>
      ) : (
        <div ref={canvasRef} data-scheduler-month-canvas="" className={styles.monthCanvas()}>
          {weeksWith(null)}
        </div>
      )}
    </SchedulerContextMenu>
  );

  return (
    <ScrollArea className={styles.board()}>
      <ScrollArea.Viewport className={styles.viewport()}>
        {drags ? (
          <SchedulerDrag
            events={events}
            format={format}
            hourHeight={undefined}
            bodyRef={canvasRef}
            measure={measureInTheMonth}
            hint={t('scheduler.drag.monthHint')}
            autoScroll={MONTH_AUTO_SCROLL}
            onEventChange={onEventChange as SchedulerDragProps<SchedulerDragPiece>['onEventChange']}
          >
            {board}
          </SchedulerDrag>
        ) : (
          board
        )}
        {hintId && (
          <span id={hintId} hidden>
            {t('scheduler.drag.monthHint')}
          </span>
        )}
      </ScrollArea.Viewport>
    </ScrollArea>
  );
}
