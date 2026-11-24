'use client';

import { useEffectEvent, useLayoutEffect, useRef } from 'react';

import { flushSync } from 'react-dom';

export function useInternalTabsContentFoundInPage(
  mounted: boolean,
  hidden: boolean,
  onFound: () => void,
) {
  const panelRef = useRef<HTMLDivElement>(null);
  const found = useEffectEvent(onFound);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel && hidden) panel.setAttribute('hidden', 'until-found');
  }, [hidden]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const selectBeforeBrowserScrolls = () => flushSync(() => found());
    panel.addEventListener('beforematch', selectBeforeBrowserScrolls);
    return () => panel.removeEventListener('beforematch', selectBeforeBrowserScrolls);
  }, [mounted]);

  return panelRef;
}
