import {
  CheckboxGroupAll,
  CheckboxGroupRoot,
  type CheckboxGroupOrientation,
  type CheckboxGroupState,
  type CheckboxGroupItemProps,
  type CheckboxGroupAllProps,
  type CheckboxGroupRenderProps,
  type CheckboxGroupProps,
} from './root';
import { checkboxGroupStyle } from './style';

export function CheckboxGroup<T extends string>(props: CheckboxGroupProps<T>) {
  return <CheckboxGroupRoot {...props} />;
}

export namespace CheckboxGroup {
  export type Props<T extends string = string> = CheckboxGroupProps<T>;
  export type State = CheckboxGroupState;
  export type Orientation = CheckboxGroupOrientation;
  export type ItemProps<T extends string = string> = CheckboxGroupItemProps<T>;
  export type AllProps = CheckboxGroupAllProps;
  export type RenderProps<T extends string = string> = CheckboxGroupRenderProps<T>;

  export const All = CheckboxGroupAll;

  export const Style = checkboxGroupStyle;
}

export type {
  CheckboxGroupOrientation,
  CheckboxGroupState,
  CheckboxGroupItemProps,
  CheckboxGroupAllProps,
  CheckboxGroupRenderProps,
  CheckboxGroupProps,
} from './root';
