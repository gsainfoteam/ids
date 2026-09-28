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

  useLayoutEffect(() => {
    latest.current = checked;
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  });

  const silently = useCheckedWrites(inputRef, checked === true, (next) => {
    if (next !== (latest.current === true)) setChecked(next);
  });

  useFormReset(inputRef, () => {
    const checkedAfterReset = controlled ? latest.current : defaultChecked;
    if (!controlled) setChecked(defaultChecked, { silent: true });
    const input = inputRef.current;
    if (!input) return;
    silently(() => {
      input.checked = checkedAfterReset === true;
    });
    input.indeterminate = checkedAfterReset === 'indeterminate';
  });

  const { state: interaction, handlers: interactionHandlers } =
    useInteractive<HTMLInputElement>(interactive);

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (readOnly) event.preventDefault();
    onClick?.(event);
  };

  const restoreIndeterminateClearedByClick = (input: HTMLInputElement) => {
    input.indeterminate = indeterminate;
  };

  const reassertCheckedAfterEngineRevert = (input: HTMLInputElement) =>
    queueMicrotask(() =>
      silently(() => {
        input.checked = latest.current === true;
      }),
    );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    restoreIndeterminateClearedByClick(input);
    const clickWasCancelled = event.nativeEvent.defaultPrevented;
    if (clickWasCancelled) {
      reassertCheckedAfterEngineRevert(input);
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
