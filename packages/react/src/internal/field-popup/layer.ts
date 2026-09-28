import { useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

export type PopupPresentation = 'popover' | 'drawer';

const DRAWER_BELOW = 640;
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

export function supportsPopover(node: HTMLElement) {
  return typeof node.showPopover === 'function';
}

export function showInTopLayer(node: HTMLElement) {
  if (!supportsPopover(node) || node.matches(':popover-open')) return;
  node.showPopover();
}

export function moveToTopOfTopLayer(node: HTMLElement) {
  const doc = node.ownerDocument;
  const focusBeforeHiding = doc.activeElement as HTMLElement | null;
  if (supportsPopover(node) && node.matches(':popover-open')) node.hidePopover();
  showInTopLayer(node);
  if (
    focusBeforeHiding &&
    node.contains(focusBeforeHiding) &&
    doc.activeElement !== focusBeforeHiding
  )
    focusBeforeHiding.focus({ preventScroll: true });
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
