import { createContext, useContext, useId, useMemo } from 'react';
import type { ComponentType, ReactNode, ComponentProps } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { invariant, tv } from '../../utils';
import { Radio } from '../radio';

import type { IdsSize } from '../../tokens/types';

type RadioGroupContextValue = {
  name: string;
  value: string | undefined;
  size: IdsSize;
  disabled: boolean;
  select: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function Item({ value, disabled = false, ...rest }: RadioGroup.ItemProps) {
  const context = useContext(RadioGroupContext);
  invariant(context != null, '`<Item>` must come from the `<RadioGroup>` render children.');

  return (
    <Radio
      {...rest}
      name={context.name}
      value={value}
      size={context.size}
      checked={context.value === value}
      disabled={disabled || context.disabled}
      onChange={(checked) => {
        if (checked) context.select(value);
      }}
    />
  );
}

export function RadioGroup<T extends string>({
  variant = 'vertical',
  size = 'standard',
  disabled = false,
  name,
  value: valueProp,
  defaultValue,
  onChange,
  className,
  children,
  ...rest
}: RadioGroup.Props<T>) {
  const generatedName = useId();
  const [value, setValue] = useControllableState<T | undefined>({
    value: valueProp,
    defaultValue,
    onChange: onChange as ((next: T | undefined) => void) | undefined,
  });

  const context: RadioGroupContextValue = {
    name: name ?? generatedName,
    value,
    size,
    disabled,
    select: (next) => setValue(next as T),
  };

  const render = useMemo(() => ({ Item: Item as ComponentType<RadioGroup.TypedItemProps<T>> }), []);

  return (
    <RadioGroupContext.Provider value={context}>
      <div role="radiogroup" {...rest} className={RadioGroup.Style({ variant, className })}>
        {children(render)}
      </div>
    </RadioGroupContext.Provider>
  );
}

export namespace RadioGroup {
  export const Style = tv({
    base: 'flex',
    variants: {
      variant: {
        vertical: 'flex-col gap-2',
        horizontal: 'flex-row flex-wrap gap-4',
      },
    },
    defaultVariants: { variant: 'vertical' },
  });

  export type ItemProps = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'name' | 'checked' | 'value' | 'onChange' | 'className' | 'children'
  > & {
    value: string;
    disabled?: boolean;
  };

  export type TypedItemProps<T extends string> = Omit<ItemProps, 'value'> & { value: T };

  export type RenderProps<T extends string> = {
    Item: ComponentType<TypedItemProps<T>>;
  };

  export type Props<T extends string> = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'role' | 'onChange' | 'defaultValue'
  > & {
    variant?: 'vertical' | 'horizontal';
    size?: IdsSize;
    disabled?: boolean;
    name?: string;
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
    className?: string;
    children: (render: RenderProps<T>) => ReactNode;
  };
}
