import { useEffect, type MouseEvent } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';
import { invariant } from '../../../utils';
import { useButton } from '../button/use-button';
import { useToggleGroupContext } from '../toggle-group';

type ToggleOwnProps = {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  value?: string;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function useToggle<P extends ToggleOwnProps>(props: P, name: string) {
  const { pressed: pressedProp, defaultPressed, onPressedChange, value, disabled, onClick } = props;
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
  const pressed = group
    ? group.type === 'multiple'
      ? group.value.has(value as string)
      : group.value === value
    : ownPressed;

  useEffect(() => {
    if (!import.meta.env.DEV || group) return;
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
      // The consumer's onClick runs first and can keep the state with preventDefault.
      onClick: (event: MouseEvent<HTMLButtonElement>): void => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (group) group.toggle(value as string);
        else setOwnPressed(!pressed);
      },
    },
    name,
  );

  const { value: _value, ...rest } = button.props as typeof button.props & { value?: string };
  return { ...button, props: rest, pressed, value, group };
}
