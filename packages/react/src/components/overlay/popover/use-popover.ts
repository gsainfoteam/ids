'use client';

import { useCallback, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  focusReturnTarget,
  initialFocusTarget,
  raiseWhatStaysAboveLayers,
  returnFocusTo,
  safePolygon,
  showInTopLayer,
  useAnchored,
  useHover,
  useInteractions,
  useLayer,
  useOverlayItem,
  usePresence,
  type AnchoredAlign,
  type AnchoredSide,
  type DismissReason,
} from '../../../internal/overlay';
import { isNodeFromAnyWindow } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export type PopoverTriggerType = 'click' | 'hover';

export type PopoverAnchor = Element | RefObject<Element | null>;

export type PopoverPlacement = {
  side: AnchoredSide;
  align: AnchoredAlign;
  sideOffset: number;
  alignOffset: number;
  anchor: PopoverAnchor | undefined;
  initialFocus: string | undefined;
};

export type UsePopoverOptions = {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  modal: boolean;
  triggerType: PopoverTriggerType;
  openDelay: number;
  closeDelay: number;
};

const ARROW_CLEARS_THE_ROUNDED_CORNER = 16;

export const DEFAULT_PLACEMENT: PopoverPlacement = {
  side: 'bottom',
  align: 'center',
  sideOffset: 8,
  alignOffset: 0,
  anchor: undefined,
  initialFocus: undefined,
};

const samePlacement = (a: PopoverPlacement, b: PopoverPlacement) =>
  (Object.keys(a) as (keyof PopoverPlacement)[]).every((key) => a[key] === b[key]);

const elementOfAnchor = (anchor: PopoverAnchor | undefined) =>
  isNodeFromAnyWindow(anchor) ? anchor : (anchor?.current ?? null);

export function usePopover({
  open: openProp,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  modal,
  triggerType,
  openDelay,
  closeDelay,
}: UsePopoverOptions) {
  const item = useOverlayItem(openProp);
  const [ownOpen, setOwnOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const open = item ? item.open : ownOpen;

  const pressedOutside = useRef(false);
  const setOpen = (next: boolean, { byPressingOutside = false } = {}) => {
    pressedOutside.current = byPressingOutside;

    if (!item) {
      setOwnOpen(next);
      return;
    }

    if (next === item.open) return;
    onOpenChange?.(next);
    if (next) return;
    item.close(undefined);
  };

  const triggerRef = useRef<HTMLElement | null>(null);
  const [trigger, setTriggerElement] = useState<HTMLElement | null>(null);
  const setTrigger = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
    setTriggerElement(node);
  }, []);

  const [content, setContent] = useState<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
  const [arrow, setArrow] = useState<Element | null>(null);

  const [placement, setPlacementState] = useState(DEFAULT_PLACEMENT);
  const setPlacement = useCallback(
    (next: PopoverPlacement) =>
      setPlacementState((previous) => (samePlacement(previous, next) ? previous : next)),
    [],
  );

  const contentCountRef = useRef(0);
  const mountContent = useCallback((anchored: boolean) => {
    contentCountRef.current += 1;

    if (isDevelopment && contentCountRef.current > 1)
      console.warn(
        '[IDS] Popover: render one Popover.Content per Popover. Put a second panel in its own Popover.',
      );
    if (isDevelopment && !triggerRef.current && !anchored)
      console.warn(
        '[IDS] Popover: add Popover.Trigger, or pass anchor to Popover.Content, so the popover has something to sit next to.',
      );

    return () => {
      contentCountRef.current -= 1;
    };
  }, []);

  const presence = usePresence(open, {
    elements: () => [content, backdrop],
    onEnterComplete: () => onOpenChangeComplete?.(true),
    onExitComplete: () => {
      item?.exited();
      onOpenChangeComplete?.(false);
    },
  });

  const anchorElement = () => trigger ?? elementOfAnchor(placement.anchor);

  const layer = useLayer(open, {
    kind: modal ? 'modal' : 'popup',
    element: () => content,
    anchor: anchorElement,
    onDismiss: (reason: DismissReason) =>
      setOpen(false, { byPressingOutside: reason === 'outside-press' }),
  });

  const anchored = useAnchored({
    open,
    onOpenChange: (next: boolean) => setOpen(next),
    reference: placement.anchor ?? trigger,
    floating: content,
    side: placement.side,
    align: placement.align,
    sideOffset: placement.sideOffset,
    alignOffset: placement.alignOffset,
    arrow,
    arrowPadding: ARROW_CLEARS_THE_ROUNDED_CORNER,
  });

  const hover = useHover(anchored.context, {
    enabled: triggerType === 'hover',
    delay: { open: openDelay, close: closeDelay },
    handleClose: safePolygon(),
  });
  const { getReferenceProps } = useInteractions([hover]);

  const requestFromTrigger = (event: Event) => {
    const next = triggerType === 'hover' ? true : !open;
    anchored.context.onOpenChange(next, event, 'click');
  };

  useLayoutEffect(() => {
    if (!content || modal) return;

    showInTopLayer(content);
    raiseWhatStaysAboveLayers();
  }, [content, modal]);

  useLayoutEffect(() => {
    if (open && content)
      initialFocusTarget(content, {
        selector: placement.initialFocus,
        holdsFocus: modal,
      })?.focus({ preventScroll: true });
  }, [open, content, modal, placement.initialFocus]);

  const wasOpen = useRef(open);

  useLayoutEffect(() => {
    const closing = wasOpen.current && !open;
    wasOpen.current = open;

    if (!closing || !content || pressedOutside.current) return;

    const focused = content.ownerDocument.activeElement;
    const focusWasInside =
      !focused || focused === content.ownerDocument.body || content.contains(focused);

    if (focusWasInside) returnFocusTo(focusReturnTarget(layer));
  }, [open, content, layer]);

  const baseId = useId();

  return {
    open,
    setOpen,
    modal,
    mounted: presence.mounted,
    ending: presence.ending,
    layer,
    anchored,
    content,
    mountContent,
    getReferenceProps,
    requestFromTrigger,
    setTrigger,
    setContent,
    setBackdrop,
    setArrow,
    setPlacement,
    ids: {
      content: `${baseId}-content`,
      title: `${baseId}-title`,
      description: `${baseId}-description`,
    },
  };
}
