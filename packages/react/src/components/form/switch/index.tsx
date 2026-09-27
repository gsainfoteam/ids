import { createContext, use, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { invariant, tv } from '../../../utils';
import { Slot } from '../../utility/slot';
import { useCheckbox } from '../checkbox/use-checkbox';
import { useFieldSize } from '../field/context';

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

type StateProp<T> = T | ((state: SwitchState) => T);

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
  styles: ReturnType<typeof Switch.Style>;
};

const SwitchContext = createContext<Context | null>(null);

function resolve<T>(value: StateProp<T>, state: SwitchState): T {
  return typeof value === 'function' ? (value as (state: SwitchState) => T)(state) : value;
}

export function Switch({
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
  const styles = Switch.Style({ size: resolvedSize });
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
        {content ?? <Switch.Thumb />}
      </span>
    </SwitchContext.Provider>
  );
}

export namespace Switch {
  export type Props = SwitchProps;
  export type State = SwitchState;

  export type ThumbProps = Omit<ComponentProps<'span'>, 'className' | 'style' | 'children'> & {
    asChild?: boolean;
    className?: StateProp<string | undefined>;
    style?: StateProp<CSSProperties | undefined>;
    children?: StateProp<ReactNode>;
  };

  export function Thumb({ asChild, className, style, children, ...props }: ThumbProps) {
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

  export namespace Thumb {
    export type Props = ThumbProps;
  }

  export const Style = tv({
    slots: {
      root: [
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 align-middle',
        'bg-(--ids-color-border) shadow-xs inset-ring-1 inset-ring-transparent focus-ring',
        'transition-[color,background-color,box-shadow] duration-(--ids-motion-fast) motion-reduce:transition-none',
        '[--switch-accent:var(--ids-color-primary)] [--switch-on-accent:var(--ids-color-on-primary)]',
        'data-invalid:[--switch-accent:var(--ids-color-danger)] data-invalid:[--switch-on-accent:var(--ids-color-on-danger)]',
        'data-[state=checked]:bg-(--switch-accent)',
        'data-disabled:opacity-50',
      ],
      input:
        'absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed',
      thumb: [
        'pointer-events-none flex shrink-0 items-center justify-center rounded-full shadow-sm',
        'bg-(--ids-color-surface) text-(--ids-color-on-muted) dark:bg-(--ids-color-on-surface)',
        'data-[state=checked]:bg-(--switch-on-accent) data-[state=checked]:text-(--switch-accent)',
        'transition-[translate,background-color] duration-(--ids-motion-fast) motion-reduce:transition-none',
        '[&>svg]:size-3/4',
      ],
    },
    variants: {
      size: {
        standard: {
          root: 'h-5 w-9',
          thumb:
            'size-4 data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4',
        },
        tiny: {
          root: 'h-4 w-7',
          thumb:
            'size-3 data-[state=checked]:translate-x-3 rtl:data-[state=checked]:-translate-x-3',
        },
      } satisfies Record<IdsSize, object>,
    },
    defaultVariants: { size: 'standard' },
  });
}
