import { type SegmentedControlOrientation } from './context';
import { SegmentedControlItem, type SegmentedControlItemProps } from './item';
import {
  SegmentedControlRoot,
  type SegmentedControlProps,
  type SegmentedControlRenderProps,
} from './root';
import { segmentedControlStyle } from './style';

export function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  return <SegmentedControlRoot {...props} />;
}

export namespace SegmentedControl {
  export type Props<T extends string = string> = SegmentedControlProps<T>;
  export type Orientation = SegmentedControlOrientation;
  export type ItemProps<T extends string = string> = SegmentedControlItemProps<T>;
  export type RenderProps<T extends string = string> = SegmentedControlRenderProps<T>;

  export const Item = SegmentedControlItem;

  export namespace Item {
    export type Props<T extends string = string> = SegmentedControlItemProps<T>;
  }

  export const Style = segmentedControlStyle;
}

export type { SegmentedControlOrientation } from './context';
export type { SegmentedControlItemProps } from './item';
export type { SegmentedControlProps, SegmentedControlRenderProps } from './root';
