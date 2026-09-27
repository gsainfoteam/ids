import { useSyncExternalStore } from 'react';

export type PopupPresentation = 'popover' | 'drawer';

// Below this width a field that asks for a drawer gets one; above it, every popup is anchored.
const SMALL_SCREEN = '(max-width: 639.98px)';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(SMALL_SCREEN);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function isSmallScreen() {
  if (typeof window.matchMedia === 'function') return window.matchMedia(SMALL_SCREEN).matches;
  return window.innerWidth < 640;
}

// Components ask this while rendering, not only the popup while positioning, because the focus
// model differs: a drawer is modal and takes focus inside, a popover leaves it on the trigger.
export function useDrawerPresentation(mobileVariant: PopupPresentation | undefined) {
  const small = useSyncExternalStore(subscribe, isSmallScreen, () => false);
  return mobileVariant === 'drawer' && small;
}

// Engines without the Popover API (and jsdom) fall back to a fixed element with a z-index.
export function supportsPopover(node: HTMLElement) {
  return typeof node.showPopover === 'function';
}

export function showInTopLayer(node: HTMLElement) {
  if (!supportsPopover(node) || node.matches(':popover-open')) return;
  node.showPopover();
}

let scrollLocks = 0;
let scrollOverflow = '';

// Nested drawers share one lock, so the page scrolls again only after the last one closes.
export function lockScroll(doc: Document) {
  const root = doc.documentElement;
  if (scrollLocks++ === 0) {
    scrollOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
  }
  return () => {
    if (--scrollLocks === 0) root.style.overflow = scrollOverflow;
  };
}

const TABBABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',');

export function tabbables(container: HTMLElement) {
  const view = container.ownerDocument.defaultView;
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)).filter((node) => {
    if (node.tabIndex < 0 || node.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    const style = view?.getComputedStyle(node);
    return style?.display !== 'none' && style?.visibility !== 'hidden';
  });
}

// Popups opened from inside another popup stack; Escape closes only the topmost one.
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
