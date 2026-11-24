'use client';

import { useCallback, useState, type MouseEvent, type Ref, type RefCallback } from 'react';

import { useInteractive, type UseInteractiveOptions } from '../../../../hooks/use-interactive';
import { mergeRefs } from '../../../../utils';

import type { useInternalChip } from './use-chip';

type InteractionOptions = UseInteractiveOptions<HTMLElement> & {
  chip: ReturnType<typeof useInternalChip>;
  rootIsButton: boolean;
  disabled: boolean;
  ref: Ref<HTMLElement> | undefined;
  onClick: ((event: MouseEvent<HTMLElement>) => void) | undefined;
};

export function useInternalChipInteraction({
  chip,
  rootIsButton,
  disabled,
  ref,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  ...interactive
}: InteractionOptions) {
  const [innerFocusVisible, setInnerFocusVisible] = useState(false);
  const { state: interaction, handlers } = useInteractive<HTMLElement>({
    ...interactive,
    disabled,
    onKeyDown: (event) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && rootIsButton && event.target === event.currentTarget)
        chip.removeOnKey(event);
    },
    onFocus: (event) => {
      onFocus?.(event);
      if (event.target !== event.currentTarget)
        setInnerFocusVisible((event.target as Element).matches(':focus-visible'));
    },
    onBlur: (event) => {
      onBlur?.(event);
      setInnerFocusVisible(false);
    },
  });
  const mergedRef: RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => mergeRefs(chip.rootRef, ref)(node),
    [chip.rootRef, ref],
  );

  const toggleOnClick = (event: MouseEvent<HTMLElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    if (chip.selectable) chip.toggle();
  };

  return { interaction, handlers, innerFocusVisible, mergedRef, toggleOnClick };
}
