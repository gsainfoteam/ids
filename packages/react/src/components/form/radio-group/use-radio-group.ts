import { useCallback, useRef, type FocusEvent, type Ref, type RefCallback } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { mergeRefs } from '../../../utils';

export type UseRadioGroupOptions<T extends string> = {
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T) => void;
  name: string;
  ref?: Ref<HTMLDivElement>;
};

export function useRadioGroup<T extends string>({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  name,
  ref,
}: UseRadioGroupOptions<T>) {
  const [value, setValue] = useControllableState<T | null>({
    value: valueProp,
    defaultValue,
    onValueChange: onValueChange as ((next: T | null) => void) | undefined,
  });
  const controlled = valueProp !== undefined;
  const rootRef = useRef<HTMLDivElement>(null);

  // Each radio is written back by its own reset handler; the group only restores its value.
  useFormReset(rootRef, () => {
    if (!controlled) setValue(defaultValue, { silent: true });
  });

  // The root is the stable target of `ref` and of a Field label's id, but the focus belongs on a
  // radio: the checked one, which is where Tab would land, or else the first that can take it.
  const focusChecked = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const radios = [
      ...event.currentTarget.querySelectorAll<HTMLInputElement>('input[type=radio]'),
    ].filter((radio) => radio.name === name && !radio.disabled);
    (radios.find((radio) => radio.checked) ?? radios[0])?.focus();
  };

  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );

  return {
    value,
    select: (next: string) => setValue(next as T),
    rootRef: mergedRef,
    focusChecked,
  };
}
