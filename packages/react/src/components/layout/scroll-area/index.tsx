import { type ComponentProps, type CSSProperties } from 'react';

import { ScrollAreaCorner, type ScrollAreaCornerProps } from './corner';
import { ScrollAreaRoot } from './root';
import { ScrollAreaScrollbar, type ScrollAreaScrollbarProps } from './scrollbar';
import { scrollAreaStyle } from './style';
import { type ScrollAreaThumbProps, ScrollAreaThumb } from './thumb';
import { ScrollAreaViewport, type ScrollAreaViewportProps } from './viewport';
import { type StateValue } from '../../../internal/state-props';

import type { IdsSize } from '../../../tokens/types';

export function ScrollArea(props: ScrollArea.Props) {
  return <ScrollAreaRoot {...props} />;
}

export namespace ScrollArea {
  export type Variant = 'auto' | 'always' | 'hover';
  export type Orientation = 'vertical' | 'horizontal' | 'both';
  export type ScrollbarOrientation = 'vertical' | 'horizontal';
  export type Fade = boolean | 'x' | 'y';

  export type State = {
    variant: Variant;
    size: IdsSize;
    orientation: Orientation;
    overflowX: boolean;
    overflowY: boolean;
    hovering: boolean;
    scrolling: boolean;
    dragging: boolean;
  };

  export type Props = Omit<ComponentProps<'div'>, 'className' | 'style'> & {
    variant?: Variant;
    size?: IdsSize;
    orientation?: Orientation;
    fade?: Fade;
    asChild?: boolean;
    className?: StateValue<string | undefined, State>;
    style?: StateValue<CSSProperties | undefined, State>;
  };
  export type ViewportProps = ScrollAreaViewportProps;
  export type ScrollbarProps = ScrollAreaScrollbarProps;
  export type ThumbProps = ScrollAreaThumbProps;
  export type CornerProps = ScrollAreaCornerProps;

  export const Viewport = ScrollAreaViewport;
  export const Scrollbar = ScrollAreaScrollbar;
  export const Thumb = ScrollAreaThumb;
  export const Corner = ScrollAreaCorner;

  export const Style = scrollAreaStyle;
}
