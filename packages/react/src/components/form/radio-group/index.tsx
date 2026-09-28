import {
  useId,
  type ComponentProps,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { RadioGroupContext } from './context';
import { useRadioGroup } from './use-radio-group';
import { tv } from '../../../utils';
import { Radio } from '../radio';

import type { IdsSize } from '../../../tokens/types';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export type RadioGroupState = {
  value: string | null;
  orientation: RadioGroupOrientation;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
};

type StateProp<T> = T | ((state: RadioGroupState) => T);

function resolve<T>(value: StateProp<T>, state: RadioGroupState): T {
  return typeof value === 'function' ? (value as (state: RadioGroupState) => T)(state) : value;
}

export type RadioGroupItemProps<T extends string> = Omit<
  Radio.Props,
  'value' | 'checked' | 'defaultChecked' | 'name'
> & { value: T };

export type RadioGroupRenderProps<T extends string> = {
  Item: ComponentType<RadioGroupItemProps<T>>;
};

export type RadioGroupProps<T extends string> = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'role' | 'className' | 'style'
> & {
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T) => void;
  name?: string;
  form?: string;
  orientation?: RadioGroupOrientation;
  size?: IdsSize;
  variant?: Radio.Variant;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  className?: StateProp<string | undefined>;
  style?: StateProp<CSSProperties | undefined>;
  children: ReactNode | ((render: RadioGroupRenderProps<T>) => ReactNode);
};

const render = { Item: Radio } as RadioGroupRenderProps<string>;

export function RadioGroup<T extends string>({
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
  invalid,
  className,
  style,
  children,
  ref,
  onFocus,
  onKeyDown,
  ...rest
}: RadioGroupProps<T>) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const { value, select, rootRef, forwardRootFocusToRadio, moveToEnd } = useRadioGroup<T>({
    value: valueProp,
    defaultValue,
    onValueChange,
    name: groupName,
    ref,
  });
  const ariaInvalid = rest['aria-invalid'] ?? invalid;
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';
  const state: RadioGroupState = {
    value,
    orientation,
    disabled,
    readOnly,
    required,
    invalid: isInvalid,
  };

  return (
    <RadioGroupContext.Provider
      value={{
        name: groupName,
        value,
        select,
        disabled,
        readOnly,
        required,
        invalid: isInvalid,
        form,
        size,
        variant,
      }}
    >
      <div
        {...rest}
        ref={rootRef}
        role="radiogroup"
        tabIndex={-1}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-required={required || undefined}
        aria-invalid={ariaInvalid}
        data-radio-group=""
        data-orientation={orientation}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        data-required={required ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        className={RadioGroup.Style({ orientation, className: resolve(className, state) })}
        style={resolve(style, state)}
        onFocus={(event) => {
          forwardRootFocusToRadio(event);
          onFocus?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) moveToEnd(event);
        }}
      >
        {typeof children === 'function'
          ? children(render as unknown as RadioGroupRenderProps<T>)
          : children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export namespace RadioGroup {
  export type Props<T extends string = string> = RadioGroupProps<T>;
  export type State = RadioGroupState;
  export type Orientation = RadioGroupOrientation;
  export type ItemProps<T extends string = string> = RadioGroupItemProps<T>;
  export type RenderProps<T extends string = string> = RadioGroupRenderProps<T>;

  export const Style = tv({
    base: 'flex outline-none',
    variants: {
      orientation: {
        vertical: 'flex-col gap-3',
        horizontal: 'flex-row flex-wrap gap-x-6 gap-y-3',
      } satisfies Record<RadioGroupOrientation, string>,
    },
    defaultVariants: { orientation: 'vertical' },
  });
}
