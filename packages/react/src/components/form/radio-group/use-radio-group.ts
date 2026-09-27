import {
  useCallback,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type Ref,
  type RefCallback,
} from 'react';

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

  useFormReset(rootRef, () => {
    if (!controlled) setValue(defaultValue, { silent: true });
  });

  const enabledRadios = (root: HTMLElement) =>
    [...root.querySelectorAll<HTMLInputElement>('input[type=radio]')].filter(
      (radio) => radio.name === name && !radio.disabled,
    );

  const focusChecked = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const radios = enabledRadios(event.currentTarget);
    (radios.find((radio) => radio.checked) ?? radios[0])?.focus();
  };

  const moveToEnd = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Home' && event.key !== 'End') return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const radios = enabledRadios(event.currentTarget);
    if (!radios.includes(event.target as HTMLInputElement)) return;
    const target = event.key === 'Home' ? radios[0]! : radios[radios.length - 1]!;
    event.preventDefault();
    target.focus();
    target.click();
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
    moveToEnd,
  };
}
