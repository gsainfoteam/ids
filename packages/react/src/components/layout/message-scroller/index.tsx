import { type ComponentProps } from 'react';

import { type ScrollOnAppend as EngineScrollOnAppend } from './lib/message-scroll';
import { MessageScrollerJump, type MessageScrollerJumpProps } from './parts/jump';
import { MessageScrollerList, type MessageScrollerListProps } from './parts/list';
import { MessageScrollerRoot } from './root';
import { messageScrollerStyle } from './style';

import type { AccessibleName } from '../../../internal/lib/accessible-name';

export function MessageScroller(props: MessageScroller.Props) {
  return <MessageScrollerRoot {...props} />;
}

export namespace MessageScroller {
  export type ScrollOnAppend = EngineScrollOnAppend;

  export type Props = ComponentProps<'div'> &
    AccessibleName & {
      onReachStart?: () => void;
      stickToBottom?: boolean;
      scrollOnAppend?: ScrollOnAppend;
    };
  export type ListProps = MessageScrollerListProps;
  export type JumpProps = MessageScrollerJumpProps;

  export const List = MessageScrollerList;
  export const Jump = MessageScrollerJump;

  export const Style = messageScrollerStyle;
}
