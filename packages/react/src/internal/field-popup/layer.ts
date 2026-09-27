import { useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

export type PopupPresentation = 'popover' | 'drawer';

const SMALL_SCREEN = '(max-width: 639.98px)';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return noop;
  const query = window.matchMedia(SMALL_SCREEN);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function isSmallScreen() {
  if (typeof window.matchMedia === 'function') return window.matchMedia(SMALL_SCREEN).matches;
  return window.innerWidth < 640;
}

export function useDrawerPresentation(mobileVariant: PopupPresentation | undefined) {
  const small = useSyncExternalStore(subscribe, isSmallScreen, () => false);
  return mobileVariant === 'drawer' && small;
}

export function supportsPopover(node: HTMLElement) {
  return typeof node.showPopover === 'function';
}

export function showInTopLayer(node: HTMLElement) {
  if (!supportsPopover(node) || node.matches(':popover-open')) return;
  node.showPopover();
}

const openPopups: HTMLElement[] = [];

export function registerPopup(node: HTMLElement) {
  openPopups.push(node);
  return () => {
    const index = openPopups.lastIndexOf(node);
    if (index >= 0) openPopups.splice(index, 1);
  };
}

export function isTopPopup(node: HTMLElement) {
  return openPopups[openPopups.length - 1] === node;
}
