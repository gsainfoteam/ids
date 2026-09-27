import { createContext, use, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { CheckIcon, MinusIcon } from '@heroicons/react/16/solid';

import { useCheckbox, type CheckedState } from './use-checkbox';
import { invariant, tv } from '../../../utils';
import { Slot } from '../../utility/slot';
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

type StateProp<T> = T | ((state: CheckboxState) => T);

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

type Context = {
  state: CheckboxState;
  styles: ReturnType<typeof Checkbox.Style>;
};

const CheckboxContext = createContext<Context | null>(null);

function resolve<T>(value: StateProp<T>, state: CheckboxState): T {
  return typeof value === 'function' ? (value as (state: CheckboxState) => T)(state) : value;
}

function dataState(state: CheckboxState) {
  if (state.indeterminate) return 'indeterminate';
  return state.checked ? 'checked' : 'unchecked';
}

export function Checkbox({
  checked: checkedProp,
  defaultChecked,
  onCheckedChange,
  invalid,
  variant = 'outline',
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
}: CheckboxProps) {
  invariant(
    checkedProp === undefined || defaultChecked === undefined,
    'Checkbox takes either `checked` or `defaultChecked`, not both.',
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
  const state: CheckboxState = {
    checked: checked === true,
    indeterminate: checked === 'indeterminate',
    disabled: Boolean(inputProps.disabled),
    readOnly,
    required: Boolean(inputProps.required),
    invalid: ariaInvalid === true || ariaInvalid === 'true',
    hovered: interaction.hovered,
    active: interaction.active,
    focused: interaction.focused,
    focusVisible: interaction.focusVisible,
  };
  const styles = Checkbox.Style({ size: resolvedSize, variant });
  const content = resolve(children, state);

  return (
    <CheckboxContext.Provider value={{ state, styles }}>
      <span
        data-checkbox=""
        data-state={dataState(state)}
        data-size={resolvedSize}
        data-variant={variant}
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
          checked={state.checked}
          aria-invalid={ariaInvalid}
          aria-readonly={readOnly || undefined}
          data-field-input=""
          className={styles.input()}
        />
        {content ?? <Checkbox.Indicator />}
      </span>
    </CheckboxContext.Provider>
  );
}

export namespace Checkbox {
  export type Props = CheckboxProps;
  export type State = CheckboxState;
  export type Variant = CheckboxVariant;
  export type Checked = CheckedState;

  export type IndicatorProps = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children'> & {
    asChild?: boolean;
    className?: StateProp<string | undefined>;
    style?: StateProp<CSSProperties | undefined>;
    children?: StateProp<ReactNode>;
  };

  export function Indicator({ asChild, className, style, children, ...props }: IndicatorProps) {
    const context = use(CheckboxContext);
    invariant(context, 'Checkbox.Indicator must be rendered inside Checkbox.');
    const { state, styles } = context;
    const content =
      resolve(children, state) ?? (state.indeterminate ? <MinusIcon /> : <CheckIcon />);
    const shared = {
      ...props,
      'aria-hidden': true,
      'data-state': dataState(state),
      className: styles.indicator({ className: resolve(className, state) }),
      style: resolve(style, state),
    };
    return asChild ? <Slot {...shared}>{content}</Slot> : <span {...shared}>{content}</span>;
  }

  export namespace Indicator {
    export type Props = IndicatorProps;
  }

  export const Style = tv({
    slots: {
      root: [
        'relative inline-flex shrink-0 items-center justify-center align-middle',
        'rounded-indicator focus-ring',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        '[--checkbox-accent:var(--ids-color-primary)] [--checkbox-on-accent:var(--ids-color-on-primary)]',
        'data-invalid:[--checkbox-accent:var(--ids-color-danger)] data-invalid:[--checkbox-on-accent:var(--ids-color-on-danger)]',
        'data-[state=checked]:bg-(--checkbox-accent) data-[state=checked]:text-(--checkbox-on-accent) data-[state=checked]:inset-ring-(--checkbox-accent)',
        'data-[state=indeterminate]:bg-(--checkbox-accent) data-[state=indeterminate]:text-(--checkbox-on-accent) data-[state=indeterminate]:inset-ring-(--checkbox-accent)',
        'data-disabled:opacity-50',
      ],
      // The real input covers the box, so a click, a tap and a wrapping <label> all reach it.
      input:
        'absolute inset-0 m-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed',
      indicator: [
        'pointer-events-none flex shrink-0 items-center justify-center [&>svg]:size-full',
        'transition-[opacity,scale] duration-(--ids-motion-fast) motion-reduce:transition-none',
        'data-[state=unchecked]:scale-50 data-[state=unchecked]:opacity-0',
      ],
    },
    variants: {
      variant: {
        outline: {
          root: 'bg-(--ids-color-surface) shadow-xs inset-ring-1 inset-ring-(--ids-color-border) dark:bg-(--ids-color-muted)/30',
        },
        soft: { root: 'bg-(--ids-color-muted) inset-ring-1 inset-ring-transparent' },
      } satisfies Record<CheckboxVariant, object>,
      size: {
        standard: { root: 'size-4', indicator: 'size-3.5' },
        tiny: { root: 'size-3.5', indicator: 'size-3' },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { variant: 'outline', size: 'standard' },
  });
}
