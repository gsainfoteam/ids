import { ToggleGroupContext, type ToggleGroupSelectionMode } from './context';
import { useToggleGroup } from './use-toggle-group';
import { FormValue } from '../../../internal/form-value';
import { tv } from '../../../utils';
import { Group, useGroupNameWarning } from '../../utility/group';

export function ToggleGroup<T extends string = string>(props: ToggleGroup.Props<T>) {
  const {
    selectionMode,
    value,
    defaultValue,
    onValueChange,
    orientation,
    disabled,
    loop,
    required,
    name,
    form,
    ref,
    className,
    children,
    ...rest
  } = props;
  useGroupNameWarning('ToggleGroup', props);
  const { context, rootProps, formValue } = useToggleGroup({
    selectionMode,
    value,
    defaultValue,
    onValueChange,
    orientation,
    disabled,
    loop,
    required,
    name,
    form,
    ref,
  });

  return (
    <ToggleGroupContext value={context}>
      <Group
        {...rest}
        {...rootProps}
        orientation={orientation}
        separator={context.selectionMode === 'single' ? 'decorative' : 'semantic'}
        className={ToggleGroup.Style({ orientation, className })}
      >
        {children}
        <FormValue {...formValue} />
      </Group>
    </ToggleGroupContext>
  );
}

export namespace ToggleGroup {
  export type SelectionMode = ToggleGroupSelectionMode;

  type CommonProps = Omit<Group.Props, 'defaultValue' | 'onChange' | 'separator' | 'role'> & {
    disabled?: boolean;
    // Arrow keys wrap from the last item to the first.
    loop?: boolean;
    // Single: an item stays checked once checked. Both: a native form refuses to submit empty.
    required?: boolean;
    // Submits each pressed value under this name.
    name?: string;
    form?: string;
  };

  export type SingleProps<T extends string = string> = CommonProps & {
    selectionMode?: 'single';
    value?: T | null;
    defaultValue?: T | null;
    onValueChange?: (value: T | null) => void;
  };

  export type MultipleProps<T extends string = string> = CommonProps & {
    selectionMode: 'multiple';
    value?: readonly T[];
    defaultValue?: readonly T[];
    onValueChange?: (value: T[]) => void;
  };

  export type Props<T extends string = string> = SingleProps<T> | MultipleProps<T>;
  export type SeparatorProps = Group.SeparatorProps;

  export const Separator = Group.Separator;

  // In a row stretched wider than its toggles, they share the width like a segmented control. A
  // column must not: a zero flex basis there collapses the toggles to no height.
  export const Style = tv({
    variants: {
      orientation: {
        horizontal: '[&>[data-toggle-group-item]]:flex-1',
        vertical: '',
      },
    },
    defaultVariants: { orientation: 'horizontal' },
  });
}
