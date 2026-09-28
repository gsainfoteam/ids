import { useId, useLayoutEffect, useRef, useState } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  safePolygon,
  useClick,
  useFloatingNodeId,
  useHover,
  useInteractions,
  useListNavigation,
  useTypeahead,
  type OpenChangeReason,
  focusReturnTarget,
  returnFocusTo,
  useAnchored,
  useLayer,
  usePresence,
  type AnchoredAlign,
  type AnchoredSide,
  type DismissReason,
} from '../../../internal/overlay';

export type MenuTriggerType = 'click' | 'contextmenu';

export type MenuPlacement = {
  side: AnchoredSide;
  align: AnchoredAlign;
  sideOffset: number;
  alignOffset: number;
};

export type UseMenuLevelOptions = {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  parentOpen: boolean | null;
  triggerType: MenuTriggerType;
};

const NESTED_HOVER_INTENT_MS = 75;

const OPEN_CHANGE_REASON: Record<DismissReason, OpenChangeReason> = {
  'escape-key': 'escape-key',
  'outside-press': 'outside-press',
  'focus-out': 'focus-out',
  covered: 'focus-out',
};

const pointAt = (x: number, y: number) => ({
  getBoundingClientRect: () => DOMRect.fromRect({ x, y, width: 0, height: 0 }),
});

export function useMenuLevel({
  open: openProp,
  defaultOpen,
  onOpenChange,
  parentOpen,
  triggerType,
}: UseMenuLevelOptions) {
  const nested = parentOpen !== null;
  const parentStaysOpen = parentOpen ?? true;

  const nodeId = useFloatingNodeId();

  const [ownOpen, setOwnOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const open = ownOpen && parentStaysOpen;

  const [lastParentOpen, setLastParentOpen] = useState(parentStaysOpen);
  if (lastParentOpen !== parentStaysOpen) {
    setLastParentOpen(parentStaysOpen);
    if (!parentStaysOpen) setOwnOpen(false, { silent: true });
  }

  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<MenuPlacement>({
    side: nested ? 'right' : 'bottom',
    align: 'start',
    sideOffset: 4,
    alignOffset: 0,
  });

  const anchored = useAnchored({
    open,
    onOpenChange: (next) => setOwnOpen(next),
    reference: trigger,
    floating: content,
    nodeId,
    ...placement,
  });
  const changeOpen = anchored.context.onOpenChange;

  const presence = usePresence(open, { elements: () => [content] });

  const layer = useLayer(open, {
    kind: 'popup',
    element: () => content,
    anchor: () => trigger,
    onDismiss: (reason, event) => {
      changeOpen(false, event, OPEN_CHANGE_REASON[reason]);
      if (reason === 'escape-key') returnFocusTo(nested ? trigger : focusReturnTarget(layer));
    },
  });

  useLayoutEffect(() => {
    if (nested || !open || !content) return;

    if (!content.contains(content.ownerDocument.activeElement))
      content.focus({ preventScroll: true });
  }, [nested, open, content]);

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const typing = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const hover = useHover(anchored.context, {
    enabled: nested,
    delay: { open: NESTED_HOVER_INTENT_MS },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(anchored.context, {
    enabled: nested || triggerType === 'click',
    toggle: !nested,
    ignoreMouse: nested,
  });
  const navigation = useListNavigation(anchored.context, {
    enabled: parentStaysOpen,
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    nested,
    loop: true,
  });
  const typeahead = useTypeahead(anchored.context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: open ? setActiveIndex : undefined,
    onTypingChange: (value) => {
      typing.current = value;
    },
  });

  const { getReferenceProps } = useInteractions([hover, click, navigation]);
  const { getFloatingProps, getItemProps } = useInteractions([hover, click, navigation, typeahead]);

  const clearHighlight = () => {
    if (activeIndex === null) return;

    setActiveIndex(null);
    content?.focus({ preventScroll: true });
  };

  const closeTree = ({ returnFocus }: { returnFocus: boolean }) => {
    const doc = content?.ownerDocument ?? document;
    const focused = doc.activeElement;
    const focusWasInside = !focused || focused === doc.body || !!content?.contains(focused);

    changeOpen(false, undefined, 'click');
    if (returnFocus && focusWasInside) returnFocusTo(focusReturnTarget(layer));
  };

  const openAt = (event: MouseEvent) => {
    anchored.refs.setPositionReference(pointAt(event.clientX, event.clientY));
    if (!open) changeOpen(true, event, 'click');
  };

  const baseId = useId();

  return {
    nested,
    nodeId,
    open,
    mounted: presence.mounted,
    ending: presence.ending,
    setOpen: (next: boolean, event?: Event) => changeOpen(next, event),
    closeTree,
    openAt,
    trigger,
    setTrigger,
    content,
    setContent,
    anchored,
    setPlacement,
    activeIndex,
    clearHighlight,
    elementsRef,
    labelsRef,
    typing,
    getReferenceProps,
    getFloatingProps,
    getItemProps,
    ids: { trigger: `${baseId}-trigger`, content: `${baseId}-content` },
  };
}

export type MenuLevel = ReturnType<typeof useMenuLevel>;
