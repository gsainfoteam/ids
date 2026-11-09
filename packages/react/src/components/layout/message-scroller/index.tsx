import { type ComponentProps } from 'react';

import { MessageScrollerList, type MessageScrollerListProps } from './list';
import { MessageScrollerRoot } from './root';
import {
  MessageScrollerScrollToBottom,
  type MessageScrollerScrollToBottomProps,
} from './scroll-to-bottom';
import { messageScrollerStyle } from './style';

export function MessageScroller(props: MessageScroller.Props) {
  return <MessageScrollerRoot {...props} />;
}

export namespace MessageScroller {
  export type ScrollOnAppend = 'start' | 'end';

  export type Props = ComponentProps<'div'> & {
    onReachStart?: () => void;
    loading?: boolean;
    stickToBottom?: boolean;
    scrollOnAppend?: ScrollOnAppend;
  };
  export type ListProps = MessageScrollerListProps;
  export type ScrollToBottomProps = MessageScrollerScrollToBottomProps;

  export const List = MessageScrollerList;
  export const ScrollToBottom = MessageScrollerScrollToBottom;

  export const Style = messageScrollerStyle;
}
