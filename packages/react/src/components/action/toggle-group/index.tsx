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
    loop?: boolean;
    required?: boolean;
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
