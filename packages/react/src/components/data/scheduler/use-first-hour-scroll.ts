'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

const HOURS_IN_DAY = 24;
const HOUR_LABEL_HEADROOM = 0.25;

export function useFirstHourScroll(
  viewportRef: RefObject<HTMLElement | null>,
  bodyRef: RefObject<HTMLElement | null>,
  firstHour: number,
) {
  const scrolledOnce = useRef(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const body = bodyRef.current;
    if (!viewport || !body) return;

    const scrollOnceLaidOut = () => {
      const laidOut = body.offsetHeight > 0 && viewport.clientHeight > 0;
      if (scrolledOnce.current || !laidOut) return;
      scrolledOnce.current = true;
      viewport.scrollTop =
        (body.offsetHeight / HOURS_IN_DAY) * Math.max(firstHour - HOUR_LABEL_HEADROOM, 0);
    };

    scrollOnceLaidOut();
    if (scrolledOnce.current) return;

    const observer = new ResizeObserver(scrollOnceLaidOut);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [viewportRef, bodyRef, firstHour]);
}
