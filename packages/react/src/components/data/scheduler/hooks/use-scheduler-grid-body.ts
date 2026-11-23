'use client';

import { useRef } from 'react';

import { useInternalFirstHourScroll } from './use-first-hour-scroll';
import { useInternalHourHeight } from './use-hour-height';

export function useInternalSchedulerGridBody(canMove: boolean, firstHour: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hourHeight = useInternalHourHeight(bodyRef, canMove);

  useInternalFirstHourScroll(viewportRef, bodyRef, firstHour);

  return { viewportRef, bodyRef, hourHeight };
}
