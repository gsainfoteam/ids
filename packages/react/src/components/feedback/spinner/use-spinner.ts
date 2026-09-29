'use client';

import { useEffect, useState, type RefObject } from 'react';

export const ANNOUNCE_DELAY = 100;

const QUIET_CONTAINERS = [
  'button',
  'a[href]',
  'label',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="treeitem"]',
  '[aria-live]',
  '[role="status"]',
  '[role="alert"]',
  '[role="log"]',
].join(',');

export type SpinnerAnnouncement = 'pending' | 'announced' | 'silent';

export function useSpinner(ref: RefObject<Element | null>, decorative: boolean | undefined) {
  const [phase, setPhase] = useState<SpinnerAnnouncement>('pending');

  useEffect(() => {
    if (decorative === true) return;
    const timer = setTimeout(() => {
      const quiet = decorative === undefined && ref.current?.closest(QUIET_CONTAINERS) != null;
      setPhase(quiet ? 'silent' : 'announced');
    }, ANNOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [ref, decorative]);

  return { announcement: decorative === true ? ('silent' as const) : phase };
}
