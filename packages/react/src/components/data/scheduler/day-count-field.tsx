'use client';

import { useState } from 'react';

import { FEWEST_DAYS, MOST_DAYS } from './layout';
import { useTranslate } from '../../../internal/translate';
import { NumberField } from '../../form/number-field';

import type { SchedulerContextValue } from './context';

const DAYS = { style: 'unit', unit: 'day', unitDisplay: 'long', maximumFractionDigits: 0 } as const;

const isDayCount = (count: number | null): count is number =>
  count !== null && Number.isInteger(count) && count >= FEWEST_DAYS && count <= MOST_DAYS;

type SchedulerDayCountFieldProps = Pick<SchedulerContextValue, 'styles'> & {
  dayCount: number;
  onDayCountChange: (count: number) => void;
  locale: string;
};

export function SchedulerDayCountField({
  styles,
  dayCount,
  onDayCountChange,
  locale,
}: SchedulerDayCountFieldProps) {
  const t = useTranslate();
  const [draft, setDraft] = useState<number | null>(dayCount);
  const [committed, setCommitted] = useState(dayCount);

  if (committed !== dayCount) {
    setCommitted(dayCount);
    setDraft(dayCount);
  }

  return (
    <NumberField
      value={draft}
      onValueChange={(count) => {
        setDraft(count);
        if (isDayCount(count)) onDayCountChange(count);
      }}
      onBlur={() => {
        if (!isDayCount(draft)) setDraft(dayCount);
      }}
      min={FEWEST_DAYS}
      max={MOST_DAYS}
      step={1}
      locale={locale}
      formatOptions={DAYS}
      aria-label={t('scheduler.dayCount')}
      incrementLabel={t('scheduler.addDay')}
      decrementLabel={t('scheduler.removeDay')}
      className={styles.dayCount()}
      data-1p-ignore
      data-lpignore="true"
    />
  );
}
