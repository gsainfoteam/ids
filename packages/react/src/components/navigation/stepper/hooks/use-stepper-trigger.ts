'use client';

import { useInteractive, type UseInteractiveOptions } from '../../../../hooks/use-interactive';
import { useInternalItemContext, useInternalRootContext } from '../context';

export function useInternalStepperTrigger({
  onKeyDown,
  onFocus,
  ...options
}: Omit<UseInteractiveOptions<HTMLButtonElement>, 'disabled'>) {
  const root = useInternalRootContext('Trigger');
  const item = useInternalItemContext('Trigger');
  const step = String(item.state.index);
  const { state: interaction, handlers } = useInteractive<HTMLButtonElement>({
    ...options,
    disabled: !item.reachable,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      root.onTriggerKeyDown(event);
    },
    onFocus: (event) => {
      onFocus?.(event);
      root.onTriggerFocus(step);
    },
  });

  return { root, item, step, interaction, handlers };
}
