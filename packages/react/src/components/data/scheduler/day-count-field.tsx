'use client';

import { use, useState } from 'react';

import { FEWEST_DAYS, MOST_DAYS } from './layout';
import { LanguageContext, useTranslate } from '../../../internal/translate';
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
  const language = use(LanguageContext);
  const [draft, setDraft] = useState<number | null>(dayCount);
  const [committed, setCommitted] = useState(dayCount);

  if (committed !== dayCount) {
    setCommitted(dayCount);
    setDraft(dayCount);
  }

  return (
    <LanguageContext value={{ ...language, tag: locale }}>
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
        formatOptions={DAYS}
        aria-label={t('scheduler.dayCount')}
        className={styles.dayCount()}
        data-1p-ignore
        data-lpignore="true"
      >
        <NumberField.Input />
        <NumberField.Stepper>
          <NumberField.Increment aria-label={t('scheduler.addDay')} />
          <NumberField.Decrement aria-label={t('scheduler.removeDay')} />
        </NumberField.Stepper>
      </NumberField>
    </LanguageContext>
  );
}
