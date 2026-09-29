'use client';

import {
  use,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { CheckboxGroupContext } from './context';
import { useCheckboxGroup } from './use-checkbox-group';
import { FormValue } from '../../../internal/form-value';
import { messages } from '../../../internal/messages';
import { invariant } from '../../../utils';
import { Checkbox } from '../checkbox';
import { checkboxGroupStyle } from './style';

import type { IdsSize } from '../../../tokens/types';

export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

export type CheckboxGroupState = {
  value: readonly string[];
  orientation: CheckboxGroupOrientation;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
};

type StateProp<T> = T | ((state: CheckboxGroupState) => T);

export type CheckboxGroupItemProps<T extends string> = Omit<
  Checkbox.Props,
  'value' | 'checked' | 'defaultChecked' | 'name'
> & { value: T };

export type CheckboxGroupAllProps = Omit<
  Checkbox.Props,
  'value' | 'checked' | 'defaultChecked' | 'name' | 'onCheckedChange'
>;

export type CheckboxGroupRenderProps<T extends string> = {
  Item: ComponentType<CheckboxGroupItemProps<T>>;
  All: ComponentType<CheckboxGroupAllProps>;
};

export type CheckboxGroupProps<T extends string> = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'role' | 'className' | 'style'
> & {
  value?: readonly T[];
  defaultValue?: readonly T[];
  onValueChange?: (value: T[]) => void;
  name?: string;
  form?: string;
  orientation?: CheckboxGroupOrientation;
  size?: IdsSize;
  variant?: Checkbox.Variant;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  requiredMessage?: string;
  invalid?: boolean;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children: ReactNode | ((render: CheckboxGroupRenderProps<T>) => ReactNode);
};

function resolve<T>(value: StateProp<T>, state: CheckboxGroupState): T {
  return typeof value === 'function' ? (value as (state: CheckboxGroupState) => T)(state) : value;
}

function All(props: CheckboxGroupAllProps) {
  const group = use(CheckboxGroupContext);
  invariant(group, 'CheckboxGroup.All must be rendered inside CheckboxGroup.');
  return (
    <Checkbox
      {...props}
      checked={group.all}
      onCheckedChange={group.setAll}
      disabled={props.disabled || group.disabled}
      readOnly={props.readOnly || group.readOnly}
      size={props.size ?? group.size}
      variant={props.variant ?? group.variant}
      aria-controls={group.controls.join(' ') || undefined}
    />
  );
}

const render = { Item: Checkbox, All } as unknown as CheckboxGroupRenderProps<string>;

export const CheckboxGroupAll = render.All;

export function CheckboxGroupRoot<T extends string>({
  value: valueProp,
  defaultValue,
  onValueChange,
  name,
  form,
  orientation = 'vertical',
  size,
  variant,
  disabled = false,
  readOnly = false,
  required = false,
  requiredMessage = messages.checkboxGroup.required,
  invalid,
  className,
  style,
  children,
  ref,
  onFocus,
  'aria-required': _unsupportedByRoleGroup,
  ...rest
}: CheckboxGroupProps<T>) {
  const {
    value,
    toggle,
    register,
    all,
    setAll,
    controls,
    anchorRef,
    rootRef,
    forwardRootFocusToBox,
  } = useCheckboxGroup<T>({ value: valueProp, defaultValue, onValueChange, ref });
  const ariaInvalid = rest['aria-invalid'] ?? invalid;
  const state: CheckboxGroupState = {
    value,
    orientation,
    disabled,
    readOnly,
    required,
    invalid: ariaInvalid === true || ariaInvalid === 'true',
  };

  return (
    <CheckboxGroupContext.Provider
      value={{
        value,
        toggle,
        register,
        all,
        setAll,
        controls,
        name,
        form,
        disabled,
        readOnly,
        invalid: state.invalid,
        size,
        variant,
      }}
    >
      <div
        {...rest}
        ref={rootRef}
        role="group"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        aria-invalid={ariaInvalid}
        data-checkbox-group=""
        data-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        data-invalid={state.invalid ? '' : undefined}
        className={checkboxGroupStyle({ orientation, className: resolve(className, state) })}
        style={resolve(style, state)}
        onFocus={(event) => {
          forwardRootFocusToBox(event);
          onFocus?.(event);
        }}
      >
        {typeof children === 'function'
          ? children(render as unknown as CheckboxGroupRenderProps<T>)
          : children}
        <FormValue
          value={value}
          form={form}
          required={required && !readOnly}
          disabled={disabled}
          anchor={anchorRef}
          message={requiredMessage}
        />
      </div>
    </CheckboxGroupContext.Provider>
  );
}
