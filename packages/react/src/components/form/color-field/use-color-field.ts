import { use, useLayoutEffect, useRef, type KeyboardEvent } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { useFormReset } from '../../../hooks/use-form-reset';
import { parseColor, serializeColor, type ColorFormat } from '../../data/color-picker/color';
import { FieldNotifyContext } from '../field/context';

export type UseColorFieldOptions = {
  value: string | undefined;
  defaultValue: string | undefined;
  onValueChange?: (value: string) => void;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  onOpenChange?: (open: boolean) => void;
  format: ColorFormat;
  alpha: boolean;
  disabled: boolean;
  readOnly: boolean;
};

export function useColorField({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  format,
  alpha,
  disabled,
  readOnly,
}: UseColorFieldOptions) {
  const [current, setValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onValueChange,
  });
  const [openState, setOpenState] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onValueChange: onOpenChange,
  });
  const blocked = disabled || readOnly;
  const isOpen = openState && !blocked;
  const parsed = parseColor(current);
  const text = parsed ? serializeColor(parsed, format, alpha) : current;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const notifyField = use(FieldNotifyContext);
  useLayoutEffect(() => {
    notifyField?.();
  }, [notifyField, current, isOpen]);

  const close = (restoreFocus: boolean) => {
    setOpenState(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const change = (next: string) => {
    if (!blocked) setValue(next);
  };

  const clear = () => {
    if (blocked) return;
    setValue('');
    triggerRef.current?.focus({ preventScroll: true });
  };

  useFormReset(triggerRef, () => {
    setValue(defaultValue ?? '');
    setOpenState(false);
  });

  return {
    state: { value: current, parsed, text, open: isOpen, blocked, invalid: !!current && !parsed },
    rootRef,
    triggerRef,
    actions: {
      close,
      change,
      clear,
      toggle: () => {
        if (!blocked) setOpenState(!isOpen);
      },
      onTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.defaultPrevented || blocked) return;
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setOpenState(true);
        }
      },
    },
  };
}
