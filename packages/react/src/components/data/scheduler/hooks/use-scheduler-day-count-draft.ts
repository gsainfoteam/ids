'use client';

import { useState } from 'react';

import { isDayCount } from '../lib/layout';

export function useInternalSchedulerDayCountDraft(
  dayCount: number,
  onDayCountChange: (count: number) => void,
) {
  const [draft, setDraft] = useState<number | null>(dayCount);
  const [committed, setCommitted] = useState(dayCount);

  if (committed !== dayCount) {
    setCommitted(dayCount);
    setDraft(dayCount);
  }

  const onValueChange = (count: number | null) => {
    setDraft(count);
    if (isDayCount(count)) onDayCountChange(count);
  };

  const onBlur = () => {
    if (!isDayCount(draft)) setDraft(dayCount);
  };

  return { draft, onValueChange, onBlur };
}
