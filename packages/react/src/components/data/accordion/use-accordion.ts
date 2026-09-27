import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { flushSync } from 'react-dom';

import {
  nextTriggerIndex,
  openValues,
  revealValue,
  toggleValue,
  type AccordionType,
  type AccordionValue,
} from './accordion-value';
import { useControllableState } from '../../../hooks/use-controllable-state';
import { isDevelopment } from '../../../utils/dev';

export const ROOT_ATTRIBUTE = 'data-accordion';
export const TRIGGER_ATTRIBUTE = 'data-accordion-trigger';

export type UseAccordionOptions<T extends string> = {
  type: AccordionType;
  value?: AccordionValue<T>;
  defaultValue?: AccordionValue<T>;
  onValueChange?: (value: AccordionValue<T>) => void;
  collapsible?: boolean;
  disabled?: boolean;
};

export function useAccordion<T extends string>({
  type,
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  disabled = false,
}: UseAccordionOptions<T>) {
  const [current, setCurrent] = useControllableState<AccordionValue<T>>({
    value,
    defaultValue: defaultValue ?? (type === 'multiple' ? [] : null),
    onValueChange,
  });
  const open = openValues(current);
  const canCollapse = type === 'multiple' || collapsible;
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = (item: T) => setCurrent(toggleValue(type, current, item, canCollapse));
  const reveal = (item: T) => setCurrent(revealValue(type, current, item));

  // Triggers are found in the DOM, so the order is the visual order whatever the React tree
  // looks like, and a nested accordion's triggers are left to that accordion.
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const root = rootRef.current;
    if (!root || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>(`[${TRIGGER_ATTRIBUTE}]`),
    ).filter((trigger) => !trigger.disabled && trigger.closest(`[${ROOT_ATTRIBUTE}]`) === root);
    const next = nextTriggerIndex(
      event.key,
      triggers.indexOf(event.currentTarget),
      triggers.length,
    );
    if (next === null) return;
    event.preventDefault();
    triggers[next]?.focus();
  };

  const registry = useRef(new Map<string, number>());
  const register = useCallback((item: string) => {
    const counts = registry.current;
    const count = (counts.get(item) ?? 0) + 1;
    counts.set(item, count);
    if (isDevelopment && count > 1)
      console.warn(`[IDS] Accordion.Item: value "${item}" is used by more than one item.`);
    return () => {
      const left = (counts.get(item) ?? 1) - 1;
      if (left === 0) counts.delete(item);
      else counts.set(item, left);
    };
  }, []);

  return {
    rootRef,
    state: { value: current, open, disabled, canCollapse },
    toggle,
    reveal,
    register,
    onTriggerKeyDown,
  };
}

export function useAccordionItem({
  value,
  open,
  disabled,
  canCollapse,
  register,
}: {
  value: string;
  open: boolean;
  disabled: boolean;
  canCollapse: boolean;
  register: (value: string) => () => void;
}) {
  const id = useId();
  useEffect(() => register(value), [register, value]);
  return {
    triggerId: `${id}-trigger`,
    contentId: `${id}-content`,
    // APG: the open panel of an accordion that cannot collapse announces its header as disabled,
    // while the header stays focusable so arrow keys still reach it.
    locked: open && !canCollapse && !disabled,
  };
}

function toMilliseconds(time: string) {
  const amount = Number.parseFloat(time);
  if (Number.isNaN(amount)) return 0;
  return time.trim().endsWith('ms') ? amount : amount * 1000;
}

function transitionTime(element: HTMLElement) {
  const style = getComputedStyle(element);
  const durations = style.transitionDuration.split(',');
  const delays = style.transitionDelay.split(',');
  return durations.reduce(
    (longest, duration, index) =>
      Math.max(longest, toMilliseconds(duration) + toMilliseconds(delays[index] ?? '0s')),
    0,
  );
}

export function useAccordionPanel({
  open,
  disabled,
  triggerId,
  onReveal,
}: {
  open: boolean;
  disabled: boolean;
  triggerId: string;
  onReveal: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // A closed panel is hidden only once its collapse has finished, so the height can animate.
  const [settled, setSettled] = useState(!open);
  if (open && settled) setSettled(false);
  const hidden = !open && settled;
  const closing = !open && !settled;

  useEffect(() => {
    if (!closing) return;
    const panel = panelRef.current;
    if (!panel) return;
    const finish = () => setSettled(true);
    const onEnd = (event: TransitionEvent) => {
      if (event.target === panel) finish();
    };
    const wait = transitionTime(panel);
    panel.addEventListener('transitionend', onEnd);
    // transitionend never fires for a panel that is not rendered or has no transition.
    const timer = window.setTimeout(finish, wait === 0 ? 0 : wait + 50);
    return () => {
      panel.removeEventListener('transitionend', onEnd);
      window.clearTimeout(timer);
    };
  }, [closing]);

  // React writes `hidden` as a boolean attribute, so "until-found" is set by hand. A panel in that
  // state stays searchable: find-in-page matches inside it and fires beforematch to open it.
  // A disabled item's content stays out of reach instead.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel && hidden) panel.setAttribute('hidden', disabled ? '' : 'until-found');
  }, [hidden, disabled]);

  // The browser scrolls to the match right after beforematch, so the panel has to be at full
  // height by then: it opens synchronously and skips the height animation once.
  const [instant, setInstant] = useState(false);
  const revealRef = useRef(onReveal);
  useLayoutEffect(() => {
    revealRef.current = onReveal;
  });
  // Attached in the same layout phase that sets "until-found", so there is no moment in which the
  // panel is searchable but nothing would open it.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const onBeforeMatch = () =>
      flushSync(() => {
        setInstant(true);
        revealRef.current();
      });
    panel.addEventListener('beforematch', onBeforeMatch);
    return () => panel.removeEventListener('beforematch', onBeforeMatch);
  }, []);
  useEffect(() => {
    if (!instant) return;
    const frame = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(frame);
  }, [instant]);

  // Closing a panel that holds focus would drop focus to the page; it goes back to the header.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (open || !panel?.contains(document.activeElement)) return;
    document.getElementById(triggerId)?.focus();
  }, [open, triggerId]);

  return { panelRef, hidden, closing, instant };
}
