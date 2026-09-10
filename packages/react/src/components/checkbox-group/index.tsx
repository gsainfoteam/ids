import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ComponentProps, ComponentType, ReactNode } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { invariant, tv } from '../../utils';
import { Checkbox } from '../checkbox';

import type { IdsSize } from '../../tokens/types';

type CheckboxGroupContextValue = {
  value: readonly string[];
  size: IdsSize;
  disabled: boolean;
  registered: readonly string[];
  register: (value: string) => () => void;
  toggle: (value: string, checked: boolean) => void;
  setAll: (checked: boolean) => void;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

function useGroup(component: string) {
  const context = useContext(CheckboxGroupContext);
  invariant(
    context != null,
    `\`<${component}>\` must come from the \`<CheckboxGroup>\` render children.`,
  );
  return context;
}

function Item({ value, disabled = false, ...rest }: CheckboxGroup.ItemProps) {
  const group = useGroup('Item');
  const { register } = group;

  useEffect(() => register(value), [register, value]);

  return (
    <Checkbox
      {...rest}
      value={value}
      size={group.size}
      checked={group.value.includes(value)}
      disabled={disabled || group.disabled}
      onChange={(checked) => group.toggle(value, checked)}
    />
  );
}

function All({ ...rest }: CheckboxGroup.AllProps) {
  const group = useGroup('All');
  const selected = group.registered.filter((item) => group.value.includes(item));
  const all = group.registered.length > 0 && selected.length === group.registered.length;

  return (
    <Checkbox
      {...rest}
      size={group.size}
      disabled={group.disabled}
      checked={all}
      indeterminate={selected.length > 0 && !all}
      onChange={() => group.setAll(!all)}
    />
  );
}

export function CheckboxGroup<T extends string>({
  variant = 'vertical',
  columns,
  size = 'standard',
  disabled = false,
  value: valueProp,
  defaultValue,
  onChange,
  className,
  style,
  children,
  ...rest
}: CheckboxGroup.Props<T>) {
  const [value, setValue] = useControllableState<readonly T[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: onChange as ((next: readonly T[]) => void) | undefined,
  });
  const [registered, setRegistered] = useState<readonly string[]>([]);

  const register = useCallback((item: string) => {
    setRegistered((prev) => (prev.includes(item) ? prev : [...prev, item]));
    return () => setRegistered((prev) => prev.filter((entry) => entry !== item));
  }, []);

  const context: CheckboxGroupContextValue = {
    value,
    size,
    disabled,
    registered,
    register,
    toggle: (item, checked) =>
      setValue(checked ? [...value, item as T] : value.filter((entry) => entry !== (item as T))),
    setAll: (checked) =>
      setValue(
        checked
          ? [...new Set([...value, ...(registered as readonly T[])])]
          : value.filter((entry) => !registered.includes(entry)),
      ),
  };

  const render = useMemo(
    () => ({
      Item: Item as ComponentType<CheckboxGroup.TypedItemProps<T>>,
      All: All as ComponentType<CheckboxGroup.AllProps>,
    }),
    [],
  );

  return (
    <CheckboxGroupContext.Provider value={context}>
      <div
        role="group"
        {...rest}
        className={CheckboxGroup.Style({ variant, className })}
        style={
          variant === 'grid' && columns != null
            ? { ...style, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
            : style
        }
      >
        {children(render)}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

export namespace CheckboxGroup {
  export const Style = tv({
    base: 'flex',
    variants: {
      variant: {
        vertical: 'flex-col gap-2',
        horizontal: 'flex-row flex-wrap gap-4',
        grid: 'grid gap-2',
      },
    },
    defaultVariants: { variant: 'vertical' },
  });

  export type ItemProps = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'checked' | 'value' | 'onChange' | 'className' | 'children'
  > & {
    value: string;
    disabled?: boolean;
  };

  export type TypedItemProps<T extends string> = Omit<ItemProps, 'value'> & { value: T };

  export type AllProps = Omit<
    ComponentProps<'input'>,
    'type' | 'size' | 'checked' | 'value' | 'onChange' | 'className' | 'children'
  >;

  export type RenderProps<T extends string> = {
    Item: ComponentType<TypedItemProps<T>>;
    All: ComponentType<AllProps>;
  };

  export type Props<T extends string> = Omit<
    ComponentProps<'div'>,
    'children' | 'className' | 'role' | 'onChange' | 'defaultValue'
  > & {
    variant?: 'vertical' | 'horizontal' | 'grid';
    columns?: number;
    size?: IdsSize;
    disabled?: boolean;
    value?: readonly T[];
    defaultValue?: readonly T[];
    onChange?: (value: readonly T[]) => void;
    className?: string;
    children: (render: RenderProps<T>) => ReactNode;
  };
}
