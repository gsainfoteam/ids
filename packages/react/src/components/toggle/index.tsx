import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import {
  useInteractiveProps,
  type InteractiveState,
  type WithInteractiveValues,
} from '../../hooks/use-interactive';
import { invariant, tv, type VariantProps } from '../../utils';
import { controlSurface } from '../control-surface';
import { useGroupedSize } from '../group';
import { useToggleGroupContext } from '../toggle-group';

import type { IdsSize } from '../../tokens/types';

export function Toggle({
  pressed: pressedProp,
  defaultPressed,
  onPressedChange,
  onClick,
  disabled,
  value,
  ...rest
}: Toggle.Props) {
  const group = useToggleGroupContext();

  invariant(
    group == null || value != null,
    '`<Toggle>` inside `<ToggleGroup>` requires a `value` prop.',
  );
  invariant(
    group == null || (pressedProp == null && defaultPressed == null && onPressedChange == null),
    '`<Toggle>` inside `<ToggleGroup>` cannot use `pressed` / `defaultPressed` / `onPressedChange`. Selection is controlled by the group.',
  );

  const inGroup = group != null;
  const itemValue = value as string;

  const [localPressed, setLocalPressed] = useControllableState({
    value: inGroup ? undefined : pressedProp,
    defaultValue: defaultPressed ?? false,
    onChange: inGroup ? undefined : onPressedChange,
  });

  const pressed = inGroup
    ? group.type === 'multiple'
      ? group.value.has(itemValue)
      : group.value === itemValue
    : localPressed;

  const isDisabled = disabled || group?.disabled;

  const {
    props: { children, className, style, variant, size, type = 'button', ...domRest },
    handlers,
    dataProps,
  } = useInteractiveProps<
    HTMLButtonElement,
    Omit<Toggle.Props, 'onPressedChange' | 'defaultPressed' | 'value'> & { pressed: boolean }
  >({
    ...rest,
    disabled: isDisabled,
    pressed,
    onClick: (e) => {
      if (isDisabled) return;
      if (inGroup) {
        group.toggle(itemValue);
      } else {
        setLocalPressed(!pressed);
      }
      onClick?.(e);
    },
  });
  const groupedSize = useGroupedSize('Toggle', size as IdsSize | undefined);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-pressed={pressed}
      data-value={value}
      className={Toggle.Style({ variant, size: groupedSize, className })}
      style={style}
      {...dataProps}
      {...handlers}
      {...domRest}
    >
      {children}
    </button>
  );
}

export namespace Toggle {
  export const Style = tv({
    base: controlSurface.base,
    variants: {
      variant: controlSurface.variant,
      size: controlSurface.size,
    },
    defaultVariants: {
      variant: 'outline',
      size: 'standard',
    },
  });

  type BaseProps = Omit<ComponentProps<'button'>, 'children' | 'className' | 'style' | 'value'> &
    VariantProps<typeof Style> & {
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
      pressed?: boolean;
      defaultPressed?: boolean;
      onPressedChange?: (pressed: boolean) => void;
      onInteractionChange?: (state: InteractiveState) => void;
      value?: string;
    };

  export type Props = WithInteractiveValues<BaseProps>;
}
