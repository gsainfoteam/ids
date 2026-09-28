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
import { keyHandler } from '../../../internal/keys';
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

  const forwardRootFocusToRadio = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const radios = enabledRadios(event.currentTarget);
    (radios.find((radio) => radio.checked) ?? radios[0])?.focus();
  };

  const chooseLikeArrowKey = (radio: HTMLInputElement) => {
    radio.focus();
    radio.click();
  };

  const moveToEnd = (event: KeyboardEvent<HTMLDivElement>) => {
    const radios = enabledRadios(event.currentTarget);
    const chooseFromFocused = (target: HTMLInputElement | undefined) => () => {
      if (!target || !radios.includes(event.target as HTMLInputElement)) return false;
      chooseLikeArrowKey(target);
    };

    keyHandler({ Home: chooseFromFocused(radios[0]), End: chooseFromFocused(radios.at(-1)) })(
      event,
    );
  };

  const mergedRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );

  return {
    value,
    select: (next: string) => setValue(next as T),
    rootRef: mergedRef,
    forwardRootFocusToRadio,
    moveToEnd,
  };
}
