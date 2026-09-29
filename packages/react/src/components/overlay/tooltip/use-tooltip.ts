'use client';

import { use, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { omit } from 'es-toolkit';
import { focusable } from 'tabbable';

import { TOOLTIP_DELAYS, TooltipDelayGroupContext } from './delay-group';
import { useControllableState } from '../../../hooks/use-controllable-state';
import {
  useDelayGroup,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type OpenChangeReason,
  focusWasReturned,
  showInTopLayer,
  useAnchored,
  useLayer,
  usePresence,
  type AnchoredAlign,
  type AnchoredSide,
  type DismissReason,
} from '../../../internal/overlay';
import { isDevelopment } from '../../../utils/dev';

export type UseTooltipOptions = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: AnchoredSide;
  align?: AnchoredAlign;
  sideOffset?: number;
  openDelay?: number;
  closeDelay?: number;
  disabled?: boolean;
};

const ARROW_KEEPS_CLEAR_OF_CORNER = 8;

const floatingReasonFor = (reason: DismissReason): OpenChangeReason =>
  reason === 'escape-key' ? 'escape-key' : 'outside-press';

export function useTooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  openDelay,
  closeDelay,
  disabled = false,
}: UseTooltipOptions) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onValueChange: onOpenChange,
  });
  const shown = open && !disabled;

  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const [arrow, setArrow] = useState<HTMLElement | null>(null);

  const requestOpen = (next: boolean, _event?: Event, reason?: OpenChangeReason) => {
    const openedByReturnedFocus =
      next && reason === 'focus' && !!trigger && focusWasReturned(trigger);
    if (next && (disabled || openedByReturnedFocus)) return;
    setOpen(next);
  };

  const anchored = useAnchored({
    open: shown,
    onOpenChange: requestOpen,
    reference: trigger,
    floating: content,
    side,
    align,
    sideOffset,
    arrow,
    arrowPadding: ARROW_KEEPS_CLEAR_OF_CORNER,
  });
  const { context } = anchored;

  const groupDelays = use(TooltipDelayGroupContext);
  const group = useDelayGroup(context, { enabled: groupDelays !== null });
  const groupIsWarm = groupDelays !== null && group.currentId != null;
  const delays = groupDelays ?? TOOLTIP_DELAYS;
  const delay = {
    open: groupIsWarm ? 0 : (openDelay ?? delays.open),
    close: closeDelay ?? delays.close,
  };

  const interactions = useInteractions([
    useHover(context, { enabled: !disabled, mouseOnly: true, move: false, delay }),
    useFocus(context, { enabled: !disabled, visibleOnly: true }),
    useRole(context, { role: 'tooltip' }),
  ]);

  const presence = usePresence(shown, { elements: () => [content] });

  useLayer(shown, {
    kind: 'tooltip',
    element: () => content,
    anchor: () => trigger,
    onDismiss: (reason, event) => context.onOpenChange(false, event, floatingReasonFor(reason)),
  });

  useLayoutEffect(() => {
    if (content?.isConnected) showInTopLayer(content);
  }, [content]);

  const warnedAboutDisabledTrigger = useRef(false);
  useEffect(() => {
    if (!isDevelopment || !trigger || warnedAboutDisabledTrigger.current) return;
    if (!trigger.matches(':disabled')) return;

    warnedAboutDisabledTrigger.current = true;
    console.warn(
      '[IDS] Tooltip: the trigger is disabled, and a disabled element gets no hover or focus, so the tooltip never opens. Wrap it in <span tabIndex={0}>, or give an IDS Button focusableWhenDisabled.',
    );
  });

  useEffect(() => {
    if (!isDevelopment || !content || focusable(content).length === 0) return;
    console.warn(
      '[IDS] Tooltip: the content holds a focusable element, which nobody can reach or press because the tooltip closes when the pointer leaves the trigger. Use Popover for interactive content.',
    );
  }, [content]);

  return {
    open: shown,
    mounted: presence.mounted,
    ending: presence.ending,
    instant: group.isInstantPhase,
    side: anchored.side,
    align: anchored.align,
    floatingStyles: anchored.floatingStyles,
    arrowPosition: anchored.middlewareData.arrow,
    trigger,
    setTrigger,
    content,
    setContent,
    setArrow,
    closeByTriggerPress: (event: Event) => context.onOpenChange(false, event, 'reference-press'),
    getReferenceProps: interactions.getReferenceProps,
    floatingProps: omit(interactions.getFloatingProps(), [
      'tabIndex',
      'data-floating-ui-focusable',
    ]),
  };
}
