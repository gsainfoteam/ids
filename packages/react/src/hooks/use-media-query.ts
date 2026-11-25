'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

const canMatchMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const unknownOnTheServer = () => false;

export function useInternalMediaQuery(query: string | null) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (query === null || !canMatchMedia()) return noop;

      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    [query],
  );
  const matches = () => query !== null && canMatchMedia() && window.matchMedia(query).matches;

  return useSyncExternalStore(subscribe, matches, unknownOnTheServer);
}
