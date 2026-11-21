'use client';

import { useMemo, useSyncExternalStore } from 'react';

import {
  CalendarDateTime,
  getLocalTimeZone,
  now as nowIn,
  parseDateTime,
} from '@internationalized/date';

const CHECK_EVERY_MS = 15_000;

function subscribeToTheClock(onTick: () => void) {
  const timer = setInterval(onTick, CHECK_EVERY_MS);
  return () => clearInterval(timer);
}

function currentMinute() {
  const time = nowIn(getLocalTimeZone());
  return new CalendarDateTime(time.year, time.month, time.day, time.hour, time.minute).toString();
}

const unknownOnTheServer = () => null;

export function useNow(fixed: CalendarDateTime | undefined) {
  const minute = useSyncExternalStore(
    subscribeToTheClock,
    fixed ? unknownOnTheServer : currentMinute,
    unknownOnTheServer,
  );

  return useMemo(() => fixed ?? (minute ? parseDateTime(minute) : undefined), [fixed, minute]);
}
