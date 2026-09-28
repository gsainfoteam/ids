import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  focusReturnTarget,
  initialFocusTarget,
  returnFocusTo,
  useLayer,
  useOverlayItem,
  usePresence,
  type LayerPosition,
} from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

const DEEPEST_NESTING_THAT_STAYS_READABLE = 2;

export type UseDialogOptions = {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  dismissible: boolean;
};

export function useDialog({
  open: openProp,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  dismissible,
}: UseDialogOptions) {
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

  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
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
    kind: 'modal',
    element: () => content,
    anchor: () => trigger,
    dismissible,
    onDismiss: (reason) => {
      if (reason === 'escape-key') setOpen(false);
    },
    onPositionChange: setPosition,
  });

  useLayoutEffect(() => {
    if (open && content)
      initialFocusTarget(content, { holdsFocus: true })?.focus({ preventScroll: true });
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

  useEffect(() => {
    if (isDevelopment && position.modalsBelow >= DEEPEST_NESTING_THAT_STAYS_READABLE)
      console.warn(
        `[IDS] Dialog: ${position.modalsBelow + 1} modal layers are open at once. Close the lower ones or move the step into the dialog that is already open.`,
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
    ids: {
      content: `${baseId}-content`,
      title: `${baseId}-title`,
      description: `${baseId}-description`,
    },
  };
}
