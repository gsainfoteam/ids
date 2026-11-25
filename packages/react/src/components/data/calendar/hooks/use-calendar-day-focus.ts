'use client';

import { useEffect, useRef } from 'react';

export function useInternalCalendarDayFocus(focused: boolean | undefined) {
  const own = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focused) own.current?.focus();
  }, [focused]);

  return own;
}
