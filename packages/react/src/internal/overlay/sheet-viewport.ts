import { useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

export type PopupPresentation = 'popover' | 'drawer';

export const DRAWER_BELOW = 640;
const SMALL_SCREEN = `(max-width: ${DRAWER_BELOW - 0.02}px)`;

function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return noop;

  const query = window.matchMedia(SMALL_SCREEN);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function isSmallScreen() {
  if (typeof window.matchMedia === 'function') return window.matchMedia(SMALL_SCREEN).matches;
  return window.innerWidth < DRAWER_BELOW;
}

export function useDrawerPresentation(mobileVariant: PopupPresentation | undefined) {
  const small = useSyncExternalStore(subscribe, isSmallScreen, () => false);
  return mobileVariant === 'drawer' && small;
}

export function coveredByKeyboard(win: Window) {
  const visual = win.visualViewport;
  return visual ? Math.max(0, win.innerHeight - visual.height - visual.offsetTop) : 0;
}

export function visibleHeight(win: Window) {
  return win.visualViewport?.height ?? win.innerHeight;
}

export function onViewportChange(win: Window, change: () => void) {
  win.addEventListener('resize', change);
  win.visualViewport?.addEventListener('resize', change);
  win.visualViewport?.addEventListener('scroll', change);

  return () => {
    win.removeEventListener('resize', change);
    win.visualViewport?.removeEventListener('resize', change);
    win.visualViewport?.removeEventListener('scroll', change);
  };
}
