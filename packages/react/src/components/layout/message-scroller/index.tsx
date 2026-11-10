import { type ComponentProps } from 'react';

import { MessageScrollerJump, type MessageScrollerJumpProps } from './jump';
import { MessageScrollerList, type MessageScrollerListProps } from './list';
import { type ScrollOnAppend as EngineScrollOnAppend } from './message-scroll';
import { MessageScrollerRoot } from './root';
import { messageScrollerStyle } from './style';

export function MessageScroller(props: MessageScroller.Props) {
  return <MessageScrollerRoot {...props} />;
}

export namespace MessageScroller {
  export type ScrollOnAppend = EngineScrollOnAppend;

  export type Props = ComponentProps<'div'> & {
    onReachStart?: () => void;
    loading?: boolean;
    stickToBottom?: boolean;
    scrollOnAppend?: ScrollOnAppend;
  };
  export type ListProps = MessageScrollerListProps;
  export type JumpProps = MessageScrollerJumpProps;

  export const List = MessageScrollerList;
  export const Jump = MessageScrollerJump;

  export const Style = messageScrollerStyle;
}
