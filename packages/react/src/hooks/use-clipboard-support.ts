'use client';

import { useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

const noSubscription = () => noop;

export function useInternalClipboardSupport() {
  return useSyncExternalStore(
    noSubscription,
    () => typeof navigator.clipboard?.writeText === 'function',
    () => false,
  );
}
