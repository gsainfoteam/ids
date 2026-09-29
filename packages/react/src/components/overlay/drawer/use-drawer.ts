'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { tabbable } from 'tabbable';

import { scaleBackground as scalePageBehind, transitionTimingOf } from './background-scale';
import { useDrawerDrag } from './use-drawer-drag';
import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  coveredByKeyboard,
  focusReturnTarget,
  initialFocusTarget,
  onViewportChange,
  raiseWhatStaysAboveLayers,
  returnFocusTo,
  showInTopLayer,
  useLayer,
  useOverlayItem,
  usePresence,
  type LayerPosition,
} from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

import type { BackgroundScale } from './background-scale';
import type { DrawerSide, SnapPoint } from './drawer-gesture';

const DEEPEST_NESTING_THAT_STAYS_READABLE = 2;

function liftAboveKeyboard(content: HTMLElement, view: Window) {
  const covered = coveredByKeyboard(view);
  content.style.bottom = covered > 0 ? `${covered}px` : '';
}

const firstFocusPastTheHandle = (content: HTMLElement) =>
  initialFocusTarget(content, { holdsFocus: false }) ??
  tabbable(content).find((element) => !element.hasAttribute('data-drawer-handle')) ??
  content;

export type UseDrawerOptions = {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  dismissible: boolean;
  side: DrawerSide;
  modal: boolean;
  scaleBackground: boolean;
  snapPoints?: readonly SnapPoint[];
  activeSnapPoint?: SnapPoint;
  defaultActiveSnapPoint?: SnapPoint;
  onActiveSnapPointChange?: (snapPoint: SnapPoint) => void;
  fadeFromIndex?: number;
};

export function useDrawer({
  open: openProp,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  dismissible,
  side,
  modal,
  scaleBackground,
  snapPoints,
  activeSnapPoint: activeSnapPointProp,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  fadeFromIndex,
}: UseDrawerOptions) {
  const item = useOverlayItem(openProp);
  const [ownOpen, setOwnOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const open = item ? item.open : ownOpen;

  const setOpen = (next: boolean) => {
    if (!item) {
      setOwnOpen(next);
      return;
    }

    if (next === item.open) return;
    onOpenChange?.(next);
    if (!next) item.close(undefined);
  };

  const [activeSnapPoint, setActiveSnapPoint] = useControllableState<SnapPoint | undefined>({
    value: activeSnapPointProp,
    defaultValue: defaultActiveSnapPoint ?? snapPoints?.[0],
    onValueChange: (next) => {
      if (next !== undefined) onActiveSnapPointChange?.(next);
    },
  });
  const activeIndex = snapPoints
    ? Math.max(0, activeSnapPoint === undefined ? 0 : snapPoints.indexOf(activeSnapPoint))
    : null;

  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
  const [handle, setHandle] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<LayerPosition>({ covered: false, modalsBelow: 0 });

  const presence = usePresence(open, {
    elements: () => [content, backdrop],
    onEnterComplete: () => onOpenChangeComplete?.(true),
    onExitComplete: () => {
      item?.exited();
      onOpenChangeComplete?.(false);
    },
  });

  const layer = useLayer(open, {
    kind: modal ? 'modal' : 'popup',
    element: () => content,
    anchor: () => trigger,
    dismissible,
    onDismiss: (reason) => {
      if (reason === 'escape-key') setOpen(false);
    },
    onPositionChange: setPosition,
  });

  useLayoutEffect(() => {
    if (modal || !open || !content) return;
    showInTopLayer(content);
    raiseWhatStaysAboveLayers();
  }, [modal, open, content]);

  useLayoutEffect(() => {
    if (open && content) firstFocusPastTheHandle(content).focus({ preventScroll: true });
  }, [open, content]);

  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;
    if (!closing || !content) return;

    const focused = content.ownerDocument.activeElement;
    const focusWasInside =
      !focused || focused === content.ownerDocument.body || content.contains(focused);
    if (focusWasInside) returnFocusTo(focusReturnTarget(layer));
  }, [open, content, layer]);

  useLayoutEffect(() => {
    if (!open || !content || side !== 'bottom') return;

    const view = content.ownerDocument.defaultView!;
    liftAboveKeyboard(content, view);
    return onViewportChange(view, () => liftAboveKeyboard(content, view));
  }, [open, content, side]);

  const background = useRef<BackgroundScale | null>(null);
  useLayoutEffect(() => {
    if (!open || !modal || !scaleBackground || !content) return;

    const claimed = scalePageBehind(content, transitionTimingOf(content));
    background.current = claimed;

    return () => {
      background.current = null;
      claimed?.release();
    };
  }, [open, modal, scaleBackground, content]);

  const drag = useDrawerDrag({
    content,
    backdrop,
    handle,
    side,
    open,
    dismissible,
    snapPoints,
    activeIndex,
    onSnap: (index) => setActiveSnapPoint(snapPoints?.[index]),
    fadeFromIndex,
    background,
    close: () => setOpen(false),
  });

  useEffect(() => {
    if (isDevelopment && position.modalsBelow >= DEEPEST_NESTING_THAT_STAYS_READABLE)
      console.warn(
        `[IDS] Drawer: ${position.modalsBelow + 1} modal layers are open at once. Close the lower ones or move the step into the drawer that is already open.`,
      );
  }, [position.modalsBelow]);

  const baseId = useId();

  return {
    open,
    setOpen,
    mounted: presence.mounted,
    ending: presence.ending,
    position,
    layer,
    content,
    setTrigger,
    setContent,
    setBackdrop,
    setHandle,
    drag,
    ids: {
      content: `${baseId}-content`,
      title: `${baseId}-title`,
      description: `${baseId}-description`,
    },
  };
}
