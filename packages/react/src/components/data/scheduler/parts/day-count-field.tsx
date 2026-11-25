'use client';

import { use } from 'react';

import { LanguageContext, useInternalTranslate } from '../../../../internal/translate';
import { NumberField } from '../../../form/number-field';
import { useInternalSchedulerDayCountDraft } from '../hooks/use-scheduler-day-count-draft';
import { FEWEST_DAYS, MOST_DAYS } from '../lib/layout';

import type { SchedulerContextValue } from '../context';

const DAYS = { style: 'unit', unit: 'day', unitDisplay: 'long', maximumFractionDigits: 0 } as const;

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
  const t = useInternalTranslate();
  const language = use(LanguageContext);
  const { draft, onValueChange, onBlur } = useInternalSchedulerDayCountDraft(
    dayCount,
    onDayCountChange,
  );

  return (
    <LanguageContext value={{ ...language, tag: locale }}>
      <NumberField
        value={draft}
        onValueChange={onValueChange}
        onBlur={onBlur}
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
