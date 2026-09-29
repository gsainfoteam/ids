import { type ToggleGroupSelectionMode } from './context';
import { ToggleGroupRoot } from './root';
import { toggleGroupStyle } from './style';
import { Group } from '../../utility/group';

export function ToggleGroup<T extends string = string>(props: ToggleGroup.Props<T>) {
  return <ToggleGroupRoot {...props} />;
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

  export const Style = toggleGroupStyle;
}
