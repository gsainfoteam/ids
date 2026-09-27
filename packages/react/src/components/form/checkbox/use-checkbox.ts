import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type ChangeEventHandler,
  type MouseEvent,
  type MouseEventHandler,
  type Ref,
  type RefCallback,
} from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { useInteractive, type UseInteractiveOptions } from '../../../hooks/use-interactive';
import { useCheckedWrites } from '../../../internal/use-checked-writes';
import { mergeRefs } from '../../../utils';

export type CheckedState = boolean | 'indeterminate';

export type UseCheckboxOptions = Omit<
  UseInteractiveOptions<HTMLInputElement>,
  'pressed' | 'onInteractionChange'
> & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: boolean) => void;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClick?: MouseEventHandler<HTMLInputElement>;
};

// Shared by Checkbox and Switch: both are a native checkbox whose checked state React owns, so
// that `data-state` and the drawn box can never disagree with the input.
export function useCheckbox({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  readOnly = false,
  ref,
  onChange,
  onClick,
  ...interactive
}: UseCheckboxOptions) {
  const [checked, setChecked] = useControllableState<CheckedState>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onValueChange: onCheckedChange as ((next: CheckedState) => void) | undefined,
  });
  const controlled = checkedProp !== undefined;
  const indeterminate = checked === 'indeterminate';
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(checked);

  // `indeterminate` is a DOM property with no attribute, and the browser clears it on every click.
  useLayoutEffect(() => {
    latest.current = checked;
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });

  const silently = useCheckedWrites(inputRef, checked === true, (next) => {
    if (next !== (latest.current === true)) setChecked(next);
  });

  // A native reset puts the input back to its `checked` attribute, which is only the first render's
  // value. An uncontrolled box returns to `defaultChecked`; a controlled one to what its parent says.
  useFormReset(inputRef, () => {
    const target = controlled ? latest.current : defaultChecked;
    if (!controlled) setChecked(defaultChecked, { silent: true });
    const input = inputRef.current;
    if (!input) return;
    silently(() => {
      input.checked = target === true;
    });
    input.indeterminate = target === 'indeterminate';
  });

  const { state: interaction, handlers: interactionHandlers } =
    useInteractive<HTMLInputElement>(interactive);

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (readOnly) event.preventDefault();
    onClick?.(event);
  };

  // React derives a checkbox's change from its click, so a click whose default was prevented, by
  // readOnly or by the consumer's onClick, still arrives here. The browser reverts that toggle.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    // A controlled parent may keep the mixed state, and then no render follows to restore it.
    input.indeterminate = indeterminate;
    if (event.nativeEvent.defaultPrevented) {
      // Some engines undo a cancelled click by toggling again, on top of React's own restore.
      queueMicrotask(() =>
        silently(() => {
          input.checked = latest.current === true;
        }),
      );
      return;
    }
    setChecked(input.checked);
    onChange?.(event);
  };

  const mergedRef: RefCallback<HTMLInputElement> = useCallback(
    (node: HTMLInputElement | null) => mergeRefs(inputRef, ref)(node),
    [ref],
  );

  return {
    checked,
    interaction,
    inputRef: mergedRef,
    handlers: { ...interactionHandlers, onClick: handleClick, onChange: handleChange },
  };
}
