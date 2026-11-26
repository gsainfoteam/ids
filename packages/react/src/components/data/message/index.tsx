import { type ComponentProps, type ReactNode } from 'react';

import { MessageActions, type MessageActionsProps } from './parts/actions';
import { MessageAvatar, type MessageAvatarProps } from './parts/avatar';
import { MessageContent, type MessageContentProps } from './parts/content';
import { MessageCopy, type MessageCopyProps } from './parts/copy';
import { MessageFooter, type MessageFooterProps } from './parts/footer';
import { MessageHeader, type MessageHeaderProps } from './parts/header';
import { MessageRetry, type MessageRetryProps } from './parts/retry';
import { MessageStatus as MessageStatusPart, type MessageStatusProps } from './parts/status';
import { MessageRoot, type MessageAlign } from './root';
import { messageStyle } from './style';

export function Message(props: Message.Props) {
  return <MessageRoot {...props} />;
}

export namespace Message {
  export type Align = MessageAlign;

  export type Props = Omit<ComponentProps<'article'>, 'children'> & {
    align?: MessageAlign;
    name?: string;
    time?: Date;
    unread?: number | boolean;
    children?: ReactNode;
  };

  export type AvatarProps = MessageAvatarProps;
  export type HeaderProps = MessageHeaderProps;
  export type ContentProps = MessageContentProps;
  export type ActionsProps = MessageActionsProps;
  export type CopyProps = MessageCopyProps;
  export type FooterProps = MessageFooterProps;
  export type StatusProps = MessageStatusProps;
  export type RetryProps = MessageRetryProps;

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

  export const Status = MessageStatusPart;
  export namespace Status {
    export type Props = MessageStatusProps;
  }

  export const Retry = MessageRetry;
  export namespace Retry {
    export type Props = MessageRetryProps;
  }

  export const Style = messageStyle;
}

export type { MessageAlign, MessageStatus } from './root';
