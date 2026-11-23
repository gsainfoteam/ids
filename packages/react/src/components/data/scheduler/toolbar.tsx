'use client';

import { use, useState } from 'react';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { getLocalTimeZone, today as todayIn } from '@internationalized/date';

import { SchedulerDayCountField } from './day-count-field';
import { stepOf, type SchedulerView } from './layout';
import { withWeekStart } from '../../../internal/date-locale';
import { LanguageContext, useTranslate } from '../../../internal/translate';
import { Button } from '../../action/button';
import { ButtonGroup } from '../../action/button-group';
import { IconButton } from '../../action/icon-button';
import { Toggle } from '../../action/toggle';
import { ToggleGroup } from '../../action/toggle-group';
import { Popover } from '../../overlay/popover';
import { Calendar } from '../calendar';

import type { SchedulerContextValue } from './context';
import type { WeekDay } from '../../../internal/date-locale';
import type { CalendarDate } from '@internationalized/date';

const THE_FOCUSABLE_DAY = '[data-calendar-day][tabindex="0"]';

type SchedulerToolbarProps = SchedulerContextValue & {
  view: SchedulerView;
  dayCount: number;
  onDayCountChange: (count: number) => void;
  onViewChange: (view: SchedulerView) => void;
  date: CalendarDate;
  onDateChange: (date: CalendarDate) => void;
  days: CalendarDate[];
  today: CalendarDate | undefined;
  locale: string;
  weekStartsOn: WeekDay;
};

export function SchedulerToolbar({
  styles,
  format,
  view,
  dayCount,
  onDayCountChange,
  onViewChange,
  date,
  onDateChange,
  days,
  today,
  locale,
  weekStartsOn,
}: SchedulerToolbarProps) {
  const t = useTranslate();
  const language = use(LanguageContext);
  const [picking, setPicking] = useState(false);
  const step = stepOf(view, dayCount);
  const range = format.range(view, days, date);
  const previousLabel = {
    month: t('scheduler.previousMonth'),
    week: t('scheduler.previousWeek'),
    days: t('scheduler.previousDays', { count: dayCount }),
    day: t('scheduler.previousDay'),
  }[view];
  const nextLabel = {
    month: t('scheduler.nextMonth'),
    week: t('scheduler.nextWeek'),
    days: t('scheduler.nextDays', { count: dayCount }),
    day: t('scheduler.nextDay'),
  }[view];

  return (
    <div className={styles.toolbar()} data-scheduler-toolbar="">
      <ButtonGroup variant="outline" aria-label={t('scheduler.navigation')}>
        <IconButton
          icon={<ChevronLeftIcon aria-hidden="true" className="rtl:-scale-x-100" />}
          aria-label={previousLabel}
          onClick={() => onDateChange(date.subtract(step))}
        />
        <Button onClick={() => onDateChange(today ?? todayIn(getLocalTimeZone()))}>
          {t('scheduler.today')}
        </Button>
        <IconButton
          icon={<ChevronRightIcon aria-hidden="true" className="rtl:-scale-x-100" />}
          aria-label={nextLabel}
          onClick={() => onDateChange(date.add(step))}
        />
      </ButtonGroup>

      <Popover open={picking} onOpenChange={setPicking}>
        <Popover.Trigger asChild>
          <Button variant="outline" data-scheduler-range="">
            {range}
            <ChevronDownIcon aria-hidden="true" className={styles.rangeIcon()} />
          </Button>
        </Popover.Trigger>
        <Popover.Content
          aria-label={t('scheduler.goToDate')}
          initialFocus={THE_FOCUSABLE_DAY}
          align="start"
          className={styles.datePopup()}
        >
          <LanguageContext value={{ ...language, locale: withWeekStart(locale, weekStartsOn) }}>
            <Calendar
              value={date}
              defaultMonth={date}
              today={today}
              onValueChange={(picked) => {
                if (picked) onDateChange(picked);
                setPicking(false);
              }}
            />
          </LanguageContext>
        </Popover.Content>
      </Popover>

      <span role="status" className="sr-only">
        {range}
      </span>

      <div className={styles.views()}>
        {view === 'days' && (
          <SchedulerDayCountField
            styles={styles}
            dayCount={dayCount}
            onDayCountChange={onDayCountChange}
            locale={locale}
          />
        )}
        <ToggleGroup
          variant="outline"
          aria-label={t('scheduler.view')}
          value={view}
          onValueChange={(next) => next && onViewChange(next as SchedulerView)}
        >
          <Toggle value="month">{t('scheduler.month')}</Toggle>
          <Toggle value="week">{t('scheduler.week')}</Toggle>
          <Toggle value="days">{t('scheduler.days', { count: dayCount })}</Toggle>
          <Toggle value="day">{t('scheduler.day')}</Toggle>
        </ToggleGroup>
      </div>
    </div>
  );
}
