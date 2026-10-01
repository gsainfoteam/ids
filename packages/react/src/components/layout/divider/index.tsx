import { type ComponentProps, type CSSProperties, type ReactNode } from 'react';

import { DividerRoot } from './root';
import { dividerStyle } from './style';

export function Divider(props: Divider.Props) {
  return <DividerRoot {...props} />;
}

export namespace Divider {
  export type Orientation = 'horizontal' | 'vertical';
  export type Align = 'start' | 'center' | 'end';

  export type State = {
    orientation: Orientation;
    labelled: boolean;
    align: Align;
    decorative: boolean;
  };

  export type Props = Omit<
    ComponentProps<'div'>,
    'role' | 'aria-orientation' | 'aria-hidden' | 'tabIndex' | 'className' | 'style'
  > & {
    orientation?: Orientation;
    align?: Align;
    decorative?: boolean;
    asChild?: boolean;
    className?: string | ((state: State) => string | undefined);
    style?: CSSProperties | ((state: State) => CSSProperties | undefined);
    children?: ReactNode;
  };

  export const Style = dividerStyle;
}
