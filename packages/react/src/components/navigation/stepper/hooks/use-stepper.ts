'use client';

import { useId, useRef } from 'react';

import { useControllableState } from '../../../../hooks/use-controllable-state';
import { useInternalRovingFocus } from '../../../utility/group/hooks/use-roving-focus';

import type { StepperOrientation } from '../root';

const NO_CURRENT_STEP = -1;

type UseStepperOptions = {
  value: number | undefined;
  defaultValue: number | undefined;
  onValueChange: ((value: number) => void) | undefined;
  orientation: StepperOrientation;
  progress: boolean;
  disabled: boolean;
};

export function useInternalStepper({
  value,
  defaultValue,
  onValueChange,
  orientation,
  progress,
  disabled,
}: UseStepperOptions) {
  const id = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? 0,
    onValueChange,
  });
  const interactive = progress && (value === undefined || onValueChange !== undefined);
  const shownValue = progress ? current : NO_CURRENT_STEP;

  const roving = useInternalRovingFocus({
    rootRef: listRef,
    ownItemSelector: `[data-stepper-trigger="${id}"]`,
    orientation,
    loop: false,
    radio: true,
    checked: String(current),
  });

  const select = (index: number) => {
    if (interactive && !disabled) setCurrent(index);
  };

  return { id, listRef, current, interactive, shownValue, roving, select };
}
