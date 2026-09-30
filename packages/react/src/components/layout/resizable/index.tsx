import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { ResizableHandle, type ResizableHandleProps } from './handle';
import { ResizableRoot } from './root';
import { resizableStyle } from './style';
import { type StateValue } from '../../../internal/state-props';

export function Resizable(props: Resizable.Props) {
  return <ResizableRoot {...props} />;
}

export namespace Resizable {
  export type Direction = 'both' | 'horizontal' | 'vertical';

  export type State = {
    direction: Direction;
    width: number | undefined;
    height: number | undefined;
    dragging: boolean;
    disabled: boolean;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style' | 'children'> & {
    direction?: Direction;
    width?: number;
    defaultWidth?: number;
    onWidthChange?: (width: number) => void;
    height?: number;
    defaultHeight?: number;
    onHeightChange?: (height: number) => void;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    disabled?: boolean;
    asChild?: boolean;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
    children?: ReactNode;
  };

  export type HandleProps = ResizableHandleProps;

  export const Handle = ResizableHandle;
  export namespace Handle {
    export type Props = ResizableHandleProps;
  }

  export const Style = resizableStyle;
}

export type ResizableProps = Resizable.Props;
