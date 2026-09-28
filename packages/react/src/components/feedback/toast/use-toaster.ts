import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { isEqual } from 'es-toolkit';

import {
  electedToaster,
  registerToaster,
  toasterHosts,
  toastRecords,
  type ToastId,
  type ToastRecord,
} from './toast-store';
import {
  blurWithin,
  keepAboveLayers,
  raiseInTopLayer,
  returnFocusTo,
  showInTopLayer,
  supportsPopover,
  withoutTransitions,
} from '../../../internal/overlay';

export type ToasterModifier = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey';

export type ToasterHotkey = ReadonlyArray<ToasterModifier | (string & {})>;

export type ToastPosition = {
  index: number;
  offset: number;
  height: number | undefined;
  front: boolean;
  visible: boolean;
  stackOrder: number;
};

export type UseToasterOptions = {
  explicit: boolean;
  max: number;
  gap: number;
  expand: boolean;
  hotkey: ToasterHotkey;
};

const NO_TOASTS: readonly ToastRecord[] = [];
const NO_HEIGHTS: ReadonlyMap<ToastId, number> = new Map();
const MODIFIERS: ReadonlySet<string> = new Set(['altKey', 'ctrlKey', 'metaKey', 'shiftKey']);
const REGION_KEY = 'F6';

function subscribeToVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
}

const tabIsHidden = () => document.visibilityState === 'hidden';
const tabIsShownOnTheServer = () => false;

function pressedRegionKey(event: KeyboardEvent, hotkey: ToasterHotkey) {
  const bareRegionKey =
    event.key === REGION_KEY &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey;
  const hotkeyHeld =
    hotkey.length > 0 &&
    hotkey.every((key) =>
      MODIFIERS.has(key) ? event[key as ToasterModifier] : event.code === key,
    );
  return bareRegionKey || hotkeyHeld;
}

function naturalHeight(node: HTMLElement) {
  const assigned = node.style.height;
  node.style.height = 'auto';
  const height = node.offsetHeight;
  node.style.height = assigned;
  return height;
}

function positionsOf(
  live: readonly ToastRecord[],
  heights: ReadonlyMap<ToastId, number>,
  gap: number,
  max: number,
) {
  const positions = new Map<ToastId, ToastPosition>();
  let offset = 0;
  live.forEach((record, index) => {
    const height = heights.get(record.id);
    positions.set(record.id, {
      index,
      offset,
      height,
      front: index === 0,
      visible: index < max,
      stackOrder: live.length - index,
    });
    offset += (height ?? 0) + gap;
  });
  return positions;
}

export function useToaster({ explicit, max, gap, expand, hotkey }: UseToasterOptions) {
  const [host] = useState(() => Symbol('toaster'));
  useLayoutEffect(() => registerToaster(host, explicit), [host, explicit]);
  const elected = useSyncExternalStore(
    toasterHosts.subscribe,
    () => electedToaster(toasterHosts.get()) === host,
    () => false,
  );
  const records = useSyncExternalStore(toastRecords.subscribe, toastRecords.get, () => NO_TOASTS);
  const tabHidden = useSyncExternalStore(subscribeToVisibility, tabIsHidden, tabIsShownOnTheServer);

  const [region, setRegion] = useState<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [heights, setHeights] = useState(NO_HEIGHTS);
  const toastElements = useRef(new Map<ToastId, HTMLElement>());
  const cameFrom = useRef<HTMLElement | null>(null);

  const toasts = elected ? records : NO_TOASTS;
  const live = toasts.filter((record) => !record.dismissed);
  const shown = toasts.length > 0;

  if (live.length === 0 && (hovered || pressing)) {
    setHovered(false);
    setPressing(false);
  }

  const releaseFocus = useCallback(
    ({ stayInRegion }: { stayInRegion: boolean }) => {
      if (!region) return;
      const back = cameFrom.current;
      cameFrom.current = null;
      if (back && !region.contains(back) && returnFocusTo(back)) return;
      const othersRemain = toastRecords.get().some((record) => !record.dismissed);
      if (stayInRegion && othersRemain) region.focus({ preventScroll: true });
      else blurWithin(region);
    },
    [region],
  );

  useLayoutEffect(() => {
    if (!region || !shown) return;
    showInTopLayer(region);
    const stopRaising = keepAboveLayers(() =>
      withoutTransitions(region, () => raiseInTopLayer(region)),
    );
    return () => {
      stopRaising();
      if (supportsPopover(region) && region.matches(':popover-open')) region.hidePopover();
    };
  }, [region, shown]);

  const measure = useCallback(() => {
    const next = new Map<ToastId, number>();
    for (const [id, node] of toastElements.current) next.set(id, naturalHeight(node));
    setHeights((previous) => (isEqual(previous, next) ? previous : next));
  }, []);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (shown) measure();
  }, [shown, toasts, measure]);

  useEffect(() => {
    if (!region || !shown || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(region);
    return () => observer.disconnect();
  }, [region, shown, measure]);

  const hasLive = live.length > 0;
  const latest = useRef({ hotkey, hasLive, releaseFocus });
  useLayoutEffect(() => {
    latest.current = { hotkey, hasLive, releaseFocus };
  });

  useEffect(() => {
    if (!region) return;
    const doc = region.ownerDocument;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!latest.current.hasLive || !pressedRegionKey(event, latest.current.hotkey)) return;
      event.preventDefault();
      if (region.contains(doc.activeElement)) latest.current.releaseFocus({ stayInRegion: false });
      else region.focus({ preventScroll: true });
    };
    doc.addEventListener('keydown', onKeyDown);
    return () => doc.removeEventListener('keydown', onKeyDown);
  }, [region]);

  useEffect(() => {
    if (!hasLive && region?.contains(region.ownerDocument.activeElement))
      releaseFocus({ stayInRegion: false });
  }, [hasLive, region, releaseFocus]);

  useEffect(() => {
    if (!pressing || !region) return;
    const doc = region.ownerDocument;
    const release = () => setPressing(false);
    doc.addEventListener('pointerup', release);
    doc.addEventListener('pointercancel', release);
    return () => {
      doc.removeEventListener('pointerup', release);
      doc.removeEventListener('pointercancel', release);
    };
  }, [pressing, region]);

  const registerToast = useCallback((id: ToastId, node: HTMLElement | null) => {
    if (node) toastElements.current.set(id, node);
    else toastElements.current.delete(id);
  }, []);

  const positions = positionsOf(live, heights, gap, max);
  const frontHeight = live[0] ? heights.get(live[0].id) : undefined;

  const regionProps = {
    ref: setRegion,
    onMouseEnter: () => setHovered(true),
    onMouseMove: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onPointerDown: () => setPressing(true),
    onPointerUp: () => setPressing(false),
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      const from = event.relatedTarget;
      if (from instanceof HTMLElement && !event.currentTarget.contains(from))
        cameFrom.current = from;
      setFocusWithin(true);
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      setFocusWithin(false);
      cameFrom.current = null;
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const composing = event.nativeEvent.isComposing || event.keyCode === 229;
      if (event.key !== 'Escape' || event.defaultPrevented || composing) return;
      event.preventDefault();
      releaseFocus({ stayInRegion: false });
    },
  };

  return {
    elected,
    toasts,
    shown,
    positions,
    frontHeight,
    expanded: expand || hovered || pressing || focusWithin,
    paused: hovered || pressing || focusWithin || tabHidden,
    regionProps,
    registerToast,
    releaseFocus,
  };
}
