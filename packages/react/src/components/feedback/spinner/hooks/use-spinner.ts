'use client';

import { useCallback, useEffect, useRef, useState, type Ref, type RefCallback } from 'react';

import { mergeRefs } from '../../../../utils';

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

export function useInternalSpinner(
  outerRef: Ref<SVGSVGElement> | undefined,
  hidden: boolean | undefined,
) {
  const ref = useRef<SVGSVGElement>(null);
  const mergedRef: RefCallback<SVGSVGElement> = useCallback(
    (node: SVGSVGElement | null) => mergeRefs(ref, outerRef)(node),
    [outerRef],
  );
  const [phase, setPhase] = useState<SpinnerAnnouncement>('pending');

  useEffect(() => {
    if (hidden === true) return;
    const timer = setTimeout(() => {
      const quiet = hidden === undefined && ref.current?.closest(QUIET_CONTAINERS) != null;
      setPhase(quiet ? 'silent' : 'announced');
    }, ANNOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [ref, hidden]);

  return { ref: mergedRef, announcement: hidden === true ? ('silent' as const) : phase };
}
