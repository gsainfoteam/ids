'use client';

import {
  useCallback,
  useEffect,
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

export type UseRadioOptions = Omit<
  UseInteractiveOptions<HTMLInputElement>,
  'pressed' | 'onInteractionChange'
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  readOnly?: boolean;
  ref?: Ref<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onClick?: MouseEventHandler<HTMLInputElement>;
};

function isGroupmate(target: EventTarget | null, input: HTMLInputElement) {
  const other = target as HTMLInputElement | null;
  return (
    other !== input &&
    other?.type === 'radio' &&
    other.name !== '' &&
    other.name === input.name &&
    other.form === input.form
  );
}

export function useRadio({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  readOnly = false,
  ref,
  onChange,
  onClick,
  ...interactive
}: UseRadioOptions) {
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onValueChange: onCheckedChange,
  });
  const controlled = checkedProp !== undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(checked);
  const adopt = useRef((_next: boolean) => {});
  useLayoutEffect(() => {
    latest.current = checked;
    adopt.current = (next) => {
      if (next !== latest.current) setChecked(next);
    };
  });

  const silently = useCheckedWrites(inputRef, checked, (next) => adopt.current(next));

  useEffect(() => {
    const input = inputRef.current;
    if (controlled || !input) return;
    const scope = input.form ?? input.ownerDocument;
    const noticeUncheckByGroupmate = (event: Event) => {
      if (isGroupmate(event.target, input)) adopt.current(input.checked);
    };
    scope.addEventListener('change', noticeUncheckByGroupmate);
    return () => scope.removeEventListener('change', noticeUncheckByGroupmate);
  }, [controlled]);

  const letReactSeeRestoredValue = (input: HTMLInputElement, restored: boolean) =>
    silently(() => {
      input.checked = restored;
    });

  useFormReset(inputRef, () => {
    const input = inputRef.current;
    if (!input) return;
    if (!controlled) {
      const restoredByBrowser = input.checked;
      letReactSeeRestoredValue(input, restoredByBrowser);
      setChecked(restoredByBrowser, { silent: true });
      return;
    }
    silently(() => {
      input.checked = latest.current;
    });
  });

  const { state: interaction, handlers: interactionHandlers } =
    useInteractive<HTMLInputElement>(interactive);

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (readOnly) event.preventDefault();
    onClick?.(event);
  };

  const reassertCheckedAfterEngineRevert = (input: HTMLInputElement) =>
    queueMicrotask(() =>
      silently(() => {
        input.checked = latest.current;
      }),
    );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
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
    controlled,
    interaction,
    inputRef: mergedRef,
    handlers: { ...interactionHandlers, onClick: handleClick, onChange: handleChange },
  };
}
