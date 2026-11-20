'use client';

import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { useSegmentedControlContext } from './context';
import { invariant } from '../../../utils';
import { useRadio } from '../radio/use-radio';

export type SegmentedControlItemProps<T extends string = string> = Omit<
  ComponentProps<'input'>,
  | 'type'
  | 'size'
  | 'value'
  | 'checked'
  | 'defaultChecked'
  | 'name'
  | 'form'
  | 'required'
  | 'readOnly'
  | 'className'
  | 'style'
  | 'children'
> & {
  value: T;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

export function SegmentedControlItem<T extends string>({
  value,
  disabled,
  className,
  style,
  children,
  ref,
  onChange,
  onClick,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...inputProps
}: SegmentedControlItemProps<T>) {
  const group = useSegmentedControlContext();
  invariant(group, 'SegmentedControl.Item must be rendered inside SegmentedControl.');

  const isDisabled = Boolean(disabled) || group.disabled;
  const { checked, interaction, inputRef, handlers } = useRadio({
    checked: group.value === value,
    onCheckedChange: (next) => {
      if (next) group.select(value);
    },
    readOnly: group.readOnly,
    disabled: isDisabled,
    ref,
    onChange,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  });

  return (
    <label
      data-segmented-control-item=""
      data-state={checked ? 'checked' : 'unchecked'}
      data-disabled={isDisabled ? '' : undefined}
      data-hovered={interaction.hovered ? '' : undefined}
      data-active={interaction.active ? '' : undefined}
      data-focus-visible={interaction.focusVisible ? '' : undefined}
      className={group.styles.item({ className })}
      style={style}
    >
      <input
        aria-invalid={group.invalid || undefined}
        {...inputProps}
        {...handlers}
        ref={inputRef}
        type="radio"
        value={value}
        name={group.name}
        form={group.form}
        disabled={disabled}
        required={group.required}
        checked={checked}
        data-field-input=""
        className={group.styles.input()}
      />
      {children}
    </label>
  );
}

SegmentedControlItem.displayName = 'SegmentedControl.Item';
