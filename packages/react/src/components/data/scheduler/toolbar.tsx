'use client';

import { useState } from 'react';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { getLocalTimeZone, today as todayIn } from '@internationalized/date';

import { stepOf, type SchedulerView } from './layout';
import { useTranslate } from '../../../internal/translate';
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
  onViewChange,
  date,
  onDateChange,
  days,
  today,
  locale,
  weekStartsOn,
}: SchedulerToolbarProps) {
  const t = useTranslate();
  const [picking, setPicking] = useState(false);
  const step = stepOf(view);
  const range = format.range(view, days);

  return (
    <div className={styles.toolbar()} data-scheduler-toolbar="">
      <ButtonGroup variant="outline" aria-label={t('scheduler.navigation')}>
        <IconButton
          icon={<ChevronLeftIcon aria-hidden="true" className="rtl:-scale-x-100" />}
          aria-label={t(view === 'week' ? 'scheduler.previousWeek' : 'scheduler.previousDay')}
          onClick={() => onDateChange(date.subtract(step))}
        />
        <Button onClick={() => onDateChange(today ?? todayIn(getLocalTimeZone()))}>
          {t('scheduler.today')}
        </Button>
        <IconButton
          icon={<ChevronRightIcon aria-hidden="true" className="rtl:-scale-x-100" />}
          aria-label={t(view === 'week' ? 'scheduler.nextWeek' : 'scheduler.nextDay')}
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
          <Calendar
            value={date}
            defaultMonth={date}
            today={today}
            locale={locale}
            weekStartsOn={weekStartsOn}
            onValueChange={(picked) => {
              if (picked) onDateChange(picked);
              setPicking(false);
            }}
          />
        </Popover.Content>
      </Popover>

      <span role="status" className="sr-only">
        {range}
      </span>

      <ToggleGroup
        variant="outline"
        aria-label={t('scheduler.view')}
        value={view}
        onValueChange={(next) => next && onViewChange(next as SchedulerView)}
        className={styles.views()}
      >
        <Toggle value="week">{t('scheduler.week')}</Toggle>
        <Toggle value="day">{t('scheduler.day')}</Toggle>
      </ToggleGroup>
    </div>
  );
}
