'use client';

import { createContext, use, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { switchStyle } from './style';
import { invariant } from '../../../utils';
import { Slot } from '../../utility/slot';
import { useCheckbox } from '../checkbox/use-checkbox';
import { useFieldSize } from '../field/context';

import type { Switch } from '.';
import type { IdsSize } from '../../../tokens/types';

export type SwitchState = {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  hovered: boolean;
  active: boolean;
  focused: boolean;
  focusVisible: boolean;
};

export type StateProp<T> = T | ((state: SwitchState) => T);

type NativeInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'role' | 'size' | 'checked' | 'defaultChecked' | 'className' | 'style' | 'children'
>;

export type SwitchProps = NativeInputProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  size?: IdsSize;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children?: StateProp<ReactNode>;
};

type Context = {
  state: SwitchState;
  styles: ReturnType<typeof switchStyle>;
};

const SwitchContext = createContext<Context | null>(null);

function resolve<T>(value: StateProp<T>, state: SwitchState): T {
  return typeof value === 'function' ? (value as (state: SwitchState) => T)(state) : value;
}

export function SwitchRoot({
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  invalid,
  size,
  className,
  style,
  children,
  ref,
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
}: SwitchProps) {
  invariant(
    checkedProp === undefined || defaultChecked === undefined,
    'Switch takes either `checked` or `defaultChecked`, not both.',
  );
  const resolvedSize = useFieldSize(size) ?? 'standard';
  const { checked, interaction, inputRef, handlers } = useCheckbox({
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    readOnly,
    disabled: inputProps.disabled,
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

  const ariaInvalid = inputProps['aria-invalid'] ?? invalid;
  const state: SwitchState = {
    checked: checked === true,
    disabled: Boolean(inputProps.disabled),
    readOnly,
    required: Boolean(inputProps.required),
    invalid: ariaInvalid === true || ariaInvalid === 'true',
    hovered: interaction.hovered,
    active: interaction.active,
    focused: interaction.focused,
    focusVisible: interaction.focusVisible,
  };
  const styles = switchStyle({ size: resolvedSize });
  const content = resolve(children, state);

  return (
    <SwitchContext.Provider value={{ state, styles }}>
      <span
        data-switch=""
        data-state={state.checked ? 'checked' : 'unchecked'}
        data-size={resolvedSize}
        data-disabled={state.disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
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
          role="switch"
          checked={state.checked}
          aria-invalid={ariaInvalid}
          aria-readonly={readOnly || undefined}
          data-field-input=""
          className={styles.input()}
        />
        {content ?? <SwitchThumb />}
      </span>
    </SwitchContext.Provider>
  );
}

export function SwitchThumb({ asChild, className, style, children, ...props }: Switch.ThumbProps) {
  const context = use(SwitchContext);
  invariant(context, 'Switch.Thumb must be rendered inside Switch.');
  const { state, styles } = context;
  const shared = {
    ...props,
    'aria-hidden': true,
    'data-state': state.checked ? 'checked' : 'unchecked',
    className: styles.thumb({ className: resolve(className, state) }),
    style: resolve(style, state),
  };
  const content = resolve(children, state);
  return asChild ? <Slot {...shared}>{content}</Slot> : <span {...shared}>{content}</span>;
}

SwitchThumb.displayName = 'Switch.Thumb';
