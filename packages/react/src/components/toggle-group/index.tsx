import { createContext, useContext, type ComponentProps, type ReactNode } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { invariant } from '../../utils';
import { GroupRoot, GroupSeparator } from '../group';

import type { StackDirection } from '../../layout/types';
import type { IdsSize } from '../../tokens/types';

type MultipleValue = Set<string> | readonly string[];

type SingleProps = {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type MultipleProps = {
  type: 'multiple';
  value?: MultipleValue;
  defaultValue?: MultipleValue;
  onValueChange?: (value: Set<string>) => void;
};

type ToggleGroupContextValue = (
  | { type: 'single'; value: string }
  | { type: 'multiple'; value: Set<string> }
) & {
  toggle: (itemValue: string) => void;
  disabled?: boolean;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext() {
  return useContext(ToggleGroupContext);
}

function assertValueShape(
  type: 'single' | 'multiple',
  name: 'value' | 'defaultValue',
  value: unknown,
) {
  if (value == null) return;

  if (type === 'multiple') {
    invariant(
      value instanceof Set || Array.isArray(value),
      `\`<ToggleGroup type="multiple">\` expects \`${name}\` to be a \`Set<string>\` or \`string[]\`.`,
    );
    return;
  }

  invariant(
    typeof value === 'string',
    `\`<ToggleGroup type="single">\` expects \`${name}\` to be a \`string\`.`,
  );
}

function toMultipleSet(value: MultipleValue): Set<string> {
  if (value instanceof Set) return value;
  return new Set(value);
}

export function ToggleGroup({
  type = 'single',
  orientation = 'horizontal',
  size = 'standard',
  disabled,
  className,
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  ...rest
}: ToggleGroup.Props) {
  const isMultiple = type === 'multiple';
  const mode = isMultiple ? 'multiple' : 'single';

  assertValueShape(mode, 'value', valueProp);
  assertValueShape(mode, 'defaultValue', defaultValue);

  const multipleValue =
    isMultiple && valueProp != null ? toMultipleSet(valueProp as MultipleValue) : undefined;
  const multipleDefault =
    isMultiple && defaultValue != null
      ? toMultipleSet(defaultValue as MultipleValue)
      : new Set<string>();

  const [value, setValue] = useControllableState<string | Set<string>>({
    value: isMultiple ? multipleValue : (valueProp as string | undefined),
    defaultValue: isMultiple ? multipleDefault : ((defaultValue as string | undefined) ?? ''),
    onChange: onValueChange as ((value: string | Set<string>) => void) | undefined,
  });

  function toggle(itemValue: string) {
    if (disabled) return;

    if (isMultiple) {
      const current = value instanceof Set ? value : new Set<string>();
      const next = new Set(current);
      if (next.has(itemValue)) next.delete(itemValue);
      else next.add(itemValue);
      setValue(next);
      return;
    }

    setValue(value === itemValue ? '' : itemValue);
  }

  const context: ToggleGroupContextValue = isMultiple
    ? {
        type: 'multiple',
        value: value instanceof Set ? value : new Set(),
        toggle,
        disabled,
      }
    : {
        type: 'single',
        value: typeof value === 'string' ? value : '',
        toggle,
        disabled,
      };

  return (
    <ToggleGroupContext.Provider value={context}>
      <GroupRoot
        orientation={orientation}
        size={size}
        className={className}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      >
        {children}
      </GroupRoot>
    </ToggleGroupContext.Provider>
  );
}

export namespace ToggleGroup {
  export const Separator = GroupSeparator;

  export type Props = (SingleProps | MultipleProps) &
    Omit<ComponentProps<'div'>, 'children' | 'className' | 'defaultValue' | 'onChange'> & {
      orientation?: StackDirection;
      size?: IdsSize;
      disabled?: boolean;
      className?: string;
      children?: ReactNode;
    };
}
