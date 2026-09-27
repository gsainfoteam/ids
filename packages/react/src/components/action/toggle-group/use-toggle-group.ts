import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type Ref,
  type RefCallback,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { mergeRefs } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { useRovingFocus } from '../../utility/group/use-roving-focus';

import type { ToggleGroupContextValue, ToggleGroupSelectionMode } from './context';
import type { GroupOrientation } from '../../utility/group';

type Value = string | null | readonly string[];

export type UseToggleGroupOptions = {
  selectionMode?: ToggleGroupSelectionMode;
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: never) => void;
  orientation?: GroupOrientation;
  disabled?: boolean;
  loop?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  ref?: Ref<HTMLDivElement>;
};

// Both modes keep a list; single mode reads and reports its one entry, or null for none.
function toList(value: Value | undefined, single: boolean) {
  if (value === undefined) return undefined;
  if (value === null) return [];
  if (typeof value === 'string') return [value];
  return single ? value.slice(0, 1) : [...value];
}

function shapeOf(value: Value | undefined) {
  return Array.isArray(value) ? 'array' : typeof value;
}

export function useToggleGroup({
  selectionMode = 'single',
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  disabled = false,
  loop = true,
  required = false,
  name,
  form,
  ref,
}: UseToggleGroupOptions) {
  const single = selectionMode === 'single';
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const setRoot: RefCallback<HTMLDivElement> = useCallback(
    (node: HTMLDivElement | null) => mergeRefs(rootRef, ref)(node),
    [ref],
  );
  const report = onValueChange as ((value: string | null | string[]) => void) | undefined;

  const defaultList = toList(defaultValue, single) ?? [];
  const [selected, setSelected] = useControllableState<string[]>({
    value: toList(value, single),
    defaultValue: defaultList,
    onValueChange: (next) => report?.(single ? (next[0] ?? null) : next),
  });

  const roving = useRovingFocus({
    rootRef,
    itemSelector: `[data-toggle-group-item="${id}"]`,
    orientation,
    loop,
    radio: single,
    checked: single ? (selected[0] ?? null) : null,
    // Arrow keys check the radio that focus lands on, through the item's own click, so the
    // item's onClick sees it too.
    onArrive: single
      ? (element) => {
          if (element.getAttribute('aria-checked') !== 'true') element.click();
        }
      : undefined,
  });

  function toggle(item: string) {
    if (disabled) return;
    if (single) {
      // A required single group behaves like radios: the checked item stays checked.
      if (selected[0] !== item) setSelected([item]);
      else if (!required) setSelected([]);
      return;
    }
    const next = selected.includes(item)
      ? selected.filter((entry) => entry !== item)
      : [...selected, item];
    // Reported in the items' order, so the value and the form entries do not depend on click order.
    const rank = (entry: string) => {
      const index = roving.items?.findIndex((candidate) => candidate.value === entry) ?? -1;
      return index === -1 ? Number.POSITIVE_INFINITY : index;
    };
    setSelected([...next].sort((a, b) => rank(a) - rank(b)));
  }

  // An item button knows its form, including a form named by the form attribute.
  const formRef = useRef<HTMLButtonElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const items = roving.elements.current;
    const button = items.find(({ element }) => element instanceof HTMLButtonElement);
    formRef.current = (button?.element as HTMLButtonElement | undefined) ?? null;
    anchorRef.current =
      items.find((item) => item.value === roving.tabStop)?.element ?? items[0]?.element ?? null;
  });
  useFormReset(formRef, () => setSelected(defaultList));

  const valueShape = shapeOf(value);
  const defaultShape = shapeOf(defaultValue);
  useEffect(() => {
    if (!isDevelopment) return;
    for (const shape of [valueShape, defaultShape]) {
      if (single && shape === 'array')
        console.warn(
          '[IDS] ToggleGroup: selectionMode="single" takes a string or null, not an array.',
        );
      if (!single && shape === 'string')
        console.warn('[IDS] ToggleGroup: selectionMode="multiple" takes a string[], not a string.');
    }
  }, [single, valueShape, defaultShape]);

  const itemValues = roving.items?.map((item) => item.value).join('\n');
  const selectedKey = selected.join('\n');
  useEffect(() => {
    if (!isDevelopment || itemValues === undefined || selectedKey === '') return;
    const known = new Set(itemValues.split('\n'));
    for (const entry of selectedKey.split('\n'))
      if (!known.has(entry)) console.warn(`[IDS] ToggleGroup: no toggle has the value "${entry}".`);
  }, [itemValues, selectedKey]);

  const context: ToggleGroupContextValue = {
    id,
    selectionMode,
    disabled,
    form,
    isPressed: (item) => selected.includes(item),
    toggle,
    tabStop: roving.tabStop,
    onItemFocus: roving.onItemFocus,
    onItemKeyDown: roving.onItemKeyDown,
  };

  return {
    context,
    rootProps: {
      ref: setRoot,
      role: single ? 'radiogroup' : 'toolbar',
      'aria-orientation': orientation,
      'aria-disabled': disabled || undefined,
      'aria-required': (single && required) || undefined,
      'data-selection-mode': selectionMode,
      'data-disabled': disabled ? '' : undefined,
    },
    formValue: { name, form, value: selected, required, disabled, anchor: anchorRef },
  };
}
