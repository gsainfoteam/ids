import { useEffect, useState, type RefObject } from 'react';

// Screen readers speak changes to a live region, not a region that appears already filled, so
// the label is written a moment after mount. A load that ends sooner is not announced at all.
export const ANNOUNCE_DELAY = 100;

// Inside these the spinner stays silent. A button, link or label takes its accessible name from
// its content, so the spinner's text would be read as part of that name; a live region already
// announces its own text.
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
