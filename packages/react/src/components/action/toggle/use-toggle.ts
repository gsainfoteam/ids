'use client';

import { useEffect, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { invariant } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { useButton } from '../button/use-button';
import { useToggleGroupContext } from '../toggle-group/context';

type ToggleOwnProps = {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  value?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
};

export function useToggle<P extends ToggleOwnProps>(props: P, name: string) {
  const {
    pressed: pressedProp,
    defaultPressed,
    onPressedChange,
    value,
    disabled,
    onClick,
    onFocus,
    onKeyDown,
  } = props;
  const group = useToggleGroupContext();

  invariant(group == null || value != null, `${name}: inside ToggleGroup a \`value\` is required.`);
  invariant(
    group == null || (pressedProp == null && defaultPressed == null && onPressedChange == null),
    `${name}: inside ToggleGroup the group owns the pressed state; drop pressed, defaultPressed and onPressedChange.`,
  );

  const [ownPressed, setOwnPressed] = useControllableState({
    value: group ? undefined : pressedProp,
    defaultValue: defaultPressed ?? false,
    onValueChange: group ? undefined : onPressedChange,
  });
  const item = value as string;
  const pressed = group ? group.isPressed(item) : ownPressed;

  useEffect(() => {
    if (!isDevelopment || group) return;
    if (pressedProp !== undefined && defaultPressed !== undefined)
      console.warn(
        `[IDS] ${name}: pass either pressed (controlled) or defaultPressed (uncontrolled), not both.`,
      );
    if (pressedProp !== undefined && onPressedChange === undefined)
      console.warn(
        `[IDS] ${name}: pressed without onPressedChange never changes. Add onPressedChange, or use defaultPressed.`,
      );
  }, [name, group, pressedProp, defaultPressed, onPressedChange]);

  const button = useButton(
    {
      ...props,
      disabled: disabled || group?.disabled,
      pressed,
      onClick: (event: MouseEvent<HTMLButtonElement>): void => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (group) group.toggle(item);
        else setOwnPressed(!pressed);
      },
      onFocus: (event: FocusEvent<HTMLButtonElement>): void => {
        onFocus?.(event);
        group?.onItemFocus(item);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>): void => {
        onKeyDown?.(event);
        group?.onItemKeyDown(event);
      },
    },
    name,
  );

  const single = group?.selectionMode === 'single';
  const toggleProps = group
    ? {
        role: single ? 'radio' : undefined,
        'aria-checked': single ? pressed : undefined,
        'aria-pressed': single ? undefined : pressed,
        tabIndex: group.tabStop === undefined ? undefined : group.tabStop === item ? 0 : -1,
        form: group.form,
        'data-toggle-group-item': group.id,
        'data-value': item,
      }
    : { 'aria-pressed': pressed, 'data-value': value };

  const { value: _value, ...rest } = button.props as typeof button.props & { value?: string };
  return { ...button, props: rest, pressed, toggleProps };
}
