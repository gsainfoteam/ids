import { useCallback, useRef, useState, type FocusEvent, type Ref, type RefCallback } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { mergeRefs } from '../../../utils';

import type { CheckedState } from '../checkbox/use-checkbox';

export type UseCheckboxGroupOptions<T extends string> = {
  value?: readonly T[];
  defaultValue?: readonly T[];
  onValueChange?: (value: T[]) => void;
  ref?: Ref<HTMLDivElement>;
};

type Registered = { value: string; id: string; disabled: boolean };

const none: readonly never[] = [];

export function useCheckboxGroup<T extends string>({
  value: valueProp,
  defaultValue = none,
  onValueChange,
  ref,
}: UseCheckboxGroupOptions<T>) {
  const [stored, setValue] = useControllableState<readonly string[]>({
    value: valueProp,
    defaultValue,
    onValueChange: onValueChange as ((next: readonly string[]) => void) | undefined,
  });
  // react-hook-form hands an unset field over as '' rather than an array.
  const value: readonly string[] = Array.isArray(stored) ? stored : none;
  const controlled = valueProp !== undefined;
  const anchorRef = useRef<HTMLDivElement>(null);

  // The children are free markup, so the group cannot list its options up front. Each checkbox
  // registers itself when it mounts, and the select-all box is computed from what is registered.
  const [items, setItems] = useState<readonly Registered[]>(none);
  const register = useCallback((itemValue: string, id: string, disabled: boolean) => {
    const entry = { value: itemValue, id, disabled };
    setItems((previous) => [...previous, entry]);
    return () => setItems((previous) => previous.filter((item) => item !== entry));
  }, []);

  const toggle = (item: string, checked: boolean) =>
    setValue(
      checked
        ? value.includes(item)
          ? value
          : [...value, item]
        : value.filter((entry) => entry !== item),
    );

  // A disabled checkbox keeps its value: select-all neither counts it nor changes it.
  const enabled = items.filter((item) => !item.disabled).map((item) => item.value);
  const selected = enabled.filter((item) => value.includes(item));
  const all: CheckedState =
    enabled.length > 0 && selected.length === enabled.length
      ? true
      : selected.length > 0
        ? 'indeterminate'
        : false;
  const setAll = (checked: boolean) =>
    setValue(
      checked
        ? [...value, ...enabled.filter((item) => !value.includes(item))]
        : value.filter((item) => !enabled.includes(item)),
    );

  useFormReset(anchorRef, () => {
    if (!controlled) setValue(defaultValue, { silent: true });
  });

  // `ref` and a Field label's id point at the root, but focus belongs on a checkbox: the first
  // checked one, or else the first that can take focus.
  const focusFirst = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const boxes = [
      ...event.currentTarget.querySelectorAll<HTMLInputElement>('input[type=checkbox]'),
    ].filter((box) => !box.disabled);
    (boxes.find((box) => box.checked) ?? boxes[0])?.focus();
  };

  const rootRef: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(anchorRef, ref)(node),
    [ref],
  );

  return {
    value,
    toggle,
    register,
    all,
    setAll,
    controls: items.filter((item) => !item.disabled).map((item) => item.id),
    anchorRef,
    rootRef,
    focusFirst,
  };
}
