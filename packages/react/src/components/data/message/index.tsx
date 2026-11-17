import { type ComponentProps, type ReactNode } from 'react';

import { MessageActions, type MessageActionsProps } from './actions';
import { MessageAvatar, type MessageAvatarProps } from './avatar';
import { MessageContent, type MessageContentProps } from './content';
import { MessageCopy, type MessageCopyProps } from './copy';
import { MessageFooter, type MessageFooterProps } from './footer';
import { MessageGroup, type MessageGroupProps } from './group';
import { MessageHeader, type MessageHeaderProps } from './header';
import { MessageRoot, type MessageAlign, type MessageShape, type MessageStatus } from './root';
import { messageStyle } from './style';

export function Message(props: Message.Props) {
  return <MessageRoot {...props} />;
}

export namespace Message {
  export type Shape = MessageShape;
  export type Align = MessageAlign;
  export type Status = MessageStatus;

  export type Props = Omit<ComponentProps<'article'>, 'children'> &
    (
      | { shape?: Extract<MessageShape, 'bubble'>; align?: MessageAlign }
      | { shape: Extract<MessageShape, 'plain'>; align?: never }
    ) & {
      name?: string;
      avatar?: string | ReactNode;
      time?: Date;
      locale?: string;
      status?: MessageStatus;
      unread?: number | boolean;
      onRetry?: () => void;
      children?: ReactNode;
    };

  export type AvatarProps = MessageAvatarProps;
  export type HeaderProps = MessageHeaderProps;
  export type ContentProps = MessageContentProps;
  export type ActionsProps = MessageActionsProps;
  export type CopyProps = MessageCopyProps;
  export type FooterProps = MessageFooterProps;
  export type GroupProps = MessageGroupProps;

  export const Avatar = MessageAvatar;
  export namespace Avatar {
    export type Props = MessageAvatarProps;
  }

  export const Header = MessageHeader;
  export namespace Header {
    export type Props = MessageHeaderProps;
  }

  export const Content = MessageContent;
  export namespace Content {
    export type Props = MessageContentProps;
  }

  export const Actions = MessageActions;
  export namespace Actions {
    export type Props = MessageActionsProps;
  }

  export const Copy = MessageCopy;
  export namespace Copy {
    export type Props = MessageCopyProps;
  }

  export const Footer = MessageFooter;
  export namespace Footer {
    export type Props = MessageFooterProps;
  }

  export const Group = MessageGroup;
  export namespace Group {
    export type Props = MessageGroupProps;
  }

  export const Style = messageStyle;
}

export type { MessageAlign, MessageShape, MessageStatus } from './root';
