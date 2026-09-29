'use client';

import { createContext, use, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { radioStyle } from './style';
import { useRadio } from './use-radio';
import { invariant } from '../../../utils';
import { Slot } from '../../utility/slot';
import { useFieldSize } from '../field/context';
import { useRadioGroupContext } from '../radio-group/context';

import type { Radio } from '.';
import type { IdsSize } from '../../../tokens/types';

export type RadioVariant = 'outline' | 'soft';

export type RadioState = {
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

export type StateProp<T> = T | ((state: RadioState) => T);

type NativeInputProps = Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'checked' | 'defaultChecked' | 'value' | 'className' | 'style' | 'children'
>;

export type RadioProps = NativeInputProps & {
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  invalid?: boolean;
  variant?: RadioVariant;
  size?: IdsSize;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children?: StateProp<ReactNode>;
};

type Context = {
  state: RadioState;
  styles: ReturnType<typeof radioStyle>;
};

const RadioContext = createContext<Context | null>(null);

function resolve<T>(value: StateProp<T>, state: RadioState): T {
  return typeof value === 'function' ? (value as (state: RadioState) => T)(state) : value;
}

export function RadioRoot({
  value,
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
  name,
  form,
  disabled,
  required,
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
}: RadioProps) {
  const group = useRadioGroupContext();
  invariant(group === null || value !== undefined, 'A Radio inside RadioGroup needs a `value`.');
  invariant(
    group === null || (checkedProp === undefined && defaultChecked === undefined),
    'A Radio inside RadioGroup is checked by the group; set `value` on RadioGroup instead.',
  );
  invariant(
    checkedProp === undefined || defaultChecked === undefined,
    'Radio takes either `checked` or `defaultChecked`, not both.',
  );

  const resolvedSize = useFieldSize(size ?? group?.size) ?? 'standard';
  const resolvedVariant = variant ?? group?.variant ?? 'outline';
  const isDisabled = Boolean(disabled) || Boolean(group?.disabled);
  const isReadOnly = readOnly || Boolean(group?.readOnly);

  const { checked, controlled, interaction, inputRef, handlers } = useRadio({
    checked: group ? group.value === value : checkedProp,
    defaultChecked,
    onCheckedChange: (next) => {
      if (group && next) group.select(value!);
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
  const state: RadioState = {
    checked,
    disabled: isDisabled,
    readOnly: isReadOnly,
    required: Boolean(required ?? group?.required),
    invalid: ariaInvalid === true || ariaInvalid === 'true',
    hovered: interaction.hovered,
    active: interaction.active,
    focused: interaction.focused,
    focusVisible: interaction.focusVisible,
  };
  const styles = radioStyle({ size: resolvedSize, variant: resolvedVariant });
  const content = resolve(children, state);

  return (
    <RadioContext.Provider value={{ state, styles }}>
      <span
        data-radio=""
        data-state={checked ? 'checked' : 'unchecked'}
        data-size={resolvedSize}
        data-variant={resolvedVariant}
        data-disabled={isDisabled ? '' : undefined}
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
          type="radio"
          value={value}
          name={group?.name ?? name}
          form={form ?? group?.form}
          disabled={isDisabled}
          required={state.required}
          {...(controlled ? { checked } : { defaultChecked })}
          aria-invalid={ariaInvalid}
          data-field-input=""
          className={styles.input()}
        />
        {content ?? <RadioIndicator />}
      </span>
    </RadioContext.Provider>
  );
}

export function RadioIndicator({
  asChild,
  className,
  style,
  children,
  ...props
}: Radio.IndicatorProps) {
  const context = use(RadioContext);
  invariant(context, 'Radio.Indicator must be rendered inside Radio.');
  const { state, styles } = context;
  const content = resolve(children, state) ?? <span className={styles.dot()} />;
  const shared = {
    ...props,
    'aria-hidden': true,
    'data-state': state.checked ? 'checked' : 'unchecked',
    className: styles.indicator({ className: resolve(className, state) }),
    style: resolve(style, state),
  };
  return asChild ? <Slot {...shared}>{content}</Slot> : <span {...shared}>{content}</span>;
}
