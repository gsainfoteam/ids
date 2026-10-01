'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefCallback,
  type RefObject,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { isDevelopment } from '../../../utils/dev';
import { useRovingFocus } from '../../utility/group/use-roving-focus';

import type { TabsActivationMode, TabsContextValue, TabsOrientation } from './context';

export type UseTabsOptions = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  loop: boolean;
};

function useRegistry() {
  const counts = useRef(new Map<string, number>());

  const register = useCallback((value: string) => {
    const map = counts.current;
    map.set(value, (map.get(value) ?? 0) + 1);
    return () => {
      const left = (map.get(value) ?? 1) - 1;
      if (left === 0) map.delete(value);
      else map.set(value, left);
    };
  }, []);

  return { counts, register };
}

function useKeptMounted() {
  const [kept, setKept] = useState<ReadonlySet<string>>(() => new Set());

  const keep = useCallback((value: string) => {
    setKept((previous) => (previous.has(value) ? previous : new Set(previous).add(value)));
    return () =>
      setKept((previous) => {
        const next = new Set(previous);
        next.delete(value);
        return next;
      });
  }, []);

  return { kept, keep };
}

type Counts = RefObject<Map<string, number>>;

function useMismatchWarnings(selected: string | undefined, triggers: Counts, contents: Counts) {
  const warned = useRef(new Set<string>());

  useEffect(() => {
    if (!isDevelopment) return;
    const warnOnce = (message: string) => {
      if (warned.current.has(message)) return;
      warned.current.add(message);
      console.warn(message);
    };
    for (const value of triggers.current.keys())
      if (!contents.current.has(value))
        warnOnce(`[IDS] Tabs.Trigger value="${value}" has no Tabs.Content with the same value.`);
    for (const value of contents.current.keys())
      if (!triggers.current.has(value))
        warnOnce(`[IDS] Tabs.Content value="${value}" has no Tabs.Trigger with the same value.`);
    const known = triggers.current;
    if (selected !== undefined && known.size > 0 && !known.has(selected))
      warnOnce(`[IDS] Tabs: value="${selected}" matches no Tabs.Trigger.`);
  });
}

export function useTabs({
  value,
  defaultValue,
  onValueChange,
  orientation,
  activationMode,
  loop,
}: UseTabsOptions) {
  const id = useId();
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onValueChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });

  const listRef = useRef<HTMLDivElement | null>(null);
  const setList: RefCallback<HTMLDivElement> = useCallback((node) => {
    listRef.current = node;
  }, []);

  const select = (next: string) => setCurrent(next);

  const roving = useRovingFocus({
    rootRef: listRef,
    ownItemSelector: `[data-tabs-trigger="${id}"]`,
    orientation,
    loop,
    radio: true,
    anyArrow: false,
    checked: current ?? null,
    onArrive:
      activationMode === 'automatic'
        ? (element) => {
            const arrived = element.dataset.value;
            if (arrived !== undefined) select(arrived);
          }
        : undefined,
  });

  const firstEnabled = roving.items?.find((item) => !item.disabled)?.value;
  const selected = current ?? firstEnabled;
  const tabStop = roving.tabStop === undefined ? current : roving.tabStop;

  const triggers = useRegistry();
  const contents = useRegistry();
  const { kept, keep } = useKeptMounted();
  useMismatchWarnings(selected, triggers.counts, contents.counts);

  const registerContentValue = contents.register;
  const registerContent = useCallback(
    (item: string, keepMounted: boolean) => {
      const unregister = registerContentValue(item);
      const release = keepMounted ? keep(item) : undefined;
      return () => {
        unregister();
        release?.();
      };
    },
    [registerContentValue, keep],
  );

  const context: Omit<TabsContextValue, 'styles'> = {
    id,
    value: selected,
    orientation,
    tabStop,
    keptMounted: kept,
    listRef: setList,
    select,
    onTriggerFocus: roving.onItemFocus,
    onTriggerKeyDown: roving.onItemKeyDown,
    registerTrigger: triggers.register,
    registerContent,
  };

  return context;
}
