'use client';

import type { ReactNode } from 'react';

export type CalendarCaptionLayout = 'label' | 'dropdown';

export type CalendarCaptionProps = {
  layout?: CalendarCaptionLayout;
  className?: string;
};

export function CalendarCaption(props: CalendarCaptionProps): ReactNode {
  void props;
  return null;
}

CalendarCaption.displayName = 'Calendar.Caption';
