'use client';

import { useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const canMatchMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

function subscribe(notify: () => void) {
  if (!canMatchMedia()) return noop;

  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}

const prefersReducedMotion = () => canMatchMedia() && window.matchMedia(REDUCED_MOTION).matches;

const noPreferenceOnTheServer = () => false;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, prefersReducedMotion, noPreferenceOnTheServer);
}
