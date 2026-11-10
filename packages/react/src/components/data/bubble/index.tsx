import { type ComponentProps } from 'react';

import { BubbleReactions, type BubbleReactionsProps } from './reactions';
import { BubbleRoot, type BubbleAlign, type BubbleVariant } from './root';
import { bubbleStyle } from './style';

export function Bubble(props: Bubble.Props) {
  return <BubbleRoot {...props} />;
}

export namespace Bubble {
  export type Align = BubbleAlign;
  export type Variant = BubbleVariant;

  export type Props = ComponentProps<'div'> & {
    align?: BubbleAlign;
    variant?: BubbleVariant;
    asChild?: boolean;
  };

  export type ReactionsProps = BubbleReactionsProps;

  export const Reactions = BubbleReactions;
  export namespace Reactions {
    export type Props = BubbleReactionsProps;
  }

  export const Style = bubbleStyle;
}

export type { BubbleAlign, BubbleVariant } from './root';
