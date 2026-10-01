import {
  RadioGroupRoot,
  type RadioGroupOrientation,
  type RadioGroupState,
  type RadioGroupItemProps,
  type RadioGroupRenderProps,
  type RadioGroupProps,
} from './root';
import { radioGroupStyle } from './style';

export function RadioGroup<T extends string>(props: RadioGroupProps<T>) {
  return <RadioGroupRoot {...props} />;
}

export namespace RadioGroup {
  export type Props<T extends string = string> = RadioGroupProps<T>;
  export type State = RadioGroupState;
  export type Orientation = RadioGroupOrientation;
  export type ItemProps<T extends string = string> = RadioGroupItemProps<T>;
  export type RenderProps<T extends string = string> = RadioGroupRenderProps<T>;

  export const Style = radioGroupStyle;
}

export {
  type RadioGroupOrientation,
  type RadioGroupState,
  type RadioGroupItemProps,
  type RadioGroupRenderProps,
  type RadioGroupProps,
} from './root';
