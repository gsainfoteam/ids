'use client';

import { useEffect } from 'react';

import { useInteractive, type UseInteractiveOptions } from '../../../../hooks/use-interactive';
import { useInternalTabsContext } from '../context';

export function useInternalTabsTrigger(
  value: string,
  { onKeyDown, onFocus, ...options }: UseInteractiveOptions<HTMLButtonElement>,
) {
  const tabs = useInternalTabsContext('Tabs.Trigger');
  const { registerTrigger } = tabs;
  useEffect(() => registerTrigger(value), [registerTrigger, value]);

  const selected = tabs.value === value;
  const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
    ...options,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) tabs.onTriggerKeyDown(event);
    },
    onFocus: (event) => {
      onFocus?.(event);
      tabs.onTriggerFocus(value);
    },
  });
  const tabIndex = tabs.tabStop === undefined ? undefined : tabs.tabStop === value ? 0 : -1;
  const controlsMountedPanel = selected || tabs.keptMounted.has(value);

  return { tabs, selected, interaction, handlers, tabIndex, controlsMountedPanel };
}
