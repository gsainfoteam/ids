import {
  useId,
  useLayoutEffect,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { dataState, resolve, type StateProp } from './checkbox-state';
import { CheckboxContext } from './context';
import { CheckboxIndicator, type CheckboxIndicatorProps } from './indicator';
import { checkboxStyle } from './style';
import { useCheckbox, type CheckedState } from './use-checkbox';
import { invariant } from '../../../utils';
import { useCheckboxGroupContext } from '../checkbox-group/context';
import { useFieldSize } from '../field/context';

import type { IdsSize } from '../../../tokens/types';

export type { CheckedState } from './use-checkbox';
export type CheckboxVariant = 'outline' | 'soft';

export type CheckboxState = {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  hovered: boolean;
  active: boolean;
  focused: boolean;
  focusVisible: boolean;
};

type NativeInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'checked' | 'defaultChecked' | 'className' | 'style' | 'children'
>;

export type CheckboxProps = NativeInputProps & {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  variant?: CheckboxVariant;
  size?: IdsSize;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children?: StateProp<ReactNode>;
};

export function Checkbox({
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  invalid,
  variant,
  size,
  className,
  style,
  children,
  ref,
  id,
  value,
  name,
  form,
  disabled,
  readOnly = false,
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
}: CheckboxProps) {
  const enclosingGroup = useCheckboxGroupContext();
  const group = value === undefined ? null : enclosingGroup;
  const option = String(value);
  invariant(
    group === null || (checkedProp === undefined && defaultChecked === undefined),
    'A Checkbox inside CheckboxGroup is checked by the group; set `value` on CheckboxGroup instead.',
  );
  invariant(
    checkedProp === undefined || defaultChecked === undefined,
    'Checkbox takes either `checked` or `defaultChecked`, not both.',
  );
  const generatedId = useId();
  const inputId = id ?? (group ? generatedId : undefined);
  const isDisabled = Boolean(disabled) || Boolean(group?.disabled);
  const register = group?.register;
  useLayoutEffect(() => {
    if (register && inputId) return register(option, inputId, isDisabled);
  }, [register, option, inputId, isDisabled]);

  const resolvedSize = useFieldSize(size ?? group?.size) ?? 'standard';
  const resolvedVariant = variant ?? group?.variant ?? 'outline';
  const isReadOnly = readOnly || Boolean(group?.readOnly);
  const { checked, interaction, inputRef, handlers } = useCheckbox({
    checked: group ? group.value.includes(option) : checkedProp,
    defaultChecked,
    onCheckedChange: (next) => {
      group?.toggle(option, next);
      onCheckedChange?.(next);
    },
    readOnly: isReadOnly,
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

  const ariaInvalid = inputProps['aria-invalid'] ?? (invalid || group?.invalid || undefined);
  const state: CheckboxState = {
    checked: checked === true,
    indeterminate: checked === 'indeterminate',
    disabled: isDisabled,
    readOnly: isReadOnly,
    required: Boolean(inputProps.required),
    invalid: ariaInvalid === true || ariaInvalid === 'true',
    hovered: interaction.hovered,
    active: interaction.active,
    focused: interaction.focused,
    focusVisible: interaction.focusVisible,
  };
  const styles = checkboxStyle({ size: resolvedSize, variant: resolvedVariant });
  const content = resolve(children, state);

  return (
    <CheckboxContext.Provider value={{ state, styles }}>
      <span
        data-checkbox=""
        data-state={dataState(state)}
        data-size={resolvedSize}
        data-variant={resolvedVariant}
        data-disabled={state.disabled ? '' : undefined}
        data-readonly={isReadOnly ? '' : undefined}
        data-required={state.required ? '' : undefined}
        data-invalid={state.invalid ? '' : undefined}
        data-hovered={state.hovered ? '' : undefined}
        data-active={state.active ? '' : undefined}
        data-focused={state.focused ? '' : undefined}
        data-focus-visible={state.focusVisible ? '' : undefined}
        className={styles.root({ className: resolve(className, state) })}
        style={resolve(style, state)}
      >
        <input
          {...inputProps}
          {...handlers}
          ref={inputRef}
          type="checkbox"
          id={inputId}
          value={value}
          name={group ? (group.name ?? name) : name}
          form={form ?? group?.form}
          disabled={isDisabled}
          checked={state.checked}
          aria-invalid={ariaInvalid}
          aria-readonly={isReadOnly || undefined}
          data-field-input=""
          className={styles.input()}
        />
        {content ?? <CheckboxIndicator />}
      </span>
    </CheckboxContext.Provider>
  );
}

export namespace Checkbox {
  export type Props = CheckboxProps;
  export type State = CheckboxState;
  export type Variant = CheckboxVariant;
  export type Checked = CheckedState;

  export type IndicatorProps = CheckboxIndicatorProps;

  export const Indicator = CheckboxIndicator;
  export namespace Indicator {
    export type Props = IndicatorProps;
  }

  export const Style = checkboxStyle;
}
