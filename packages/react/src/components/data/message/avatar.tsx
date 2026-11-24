'use client';

import { useMessageContext } from './context';
import { Avatar } from '../avatar';

export type MessageAvatarProps = Avatar.Props;

export function MessageAvatar(props: MessageAvatarProps) {
  const { styles, name } = useMessageContext('Message.Avatar');

  return (
    <span aria-hidden="true" data-message-avatar="" className={styles.avatar()}>
      <Avatar name={name} {...props} />
    </span>
  );
}

MessageAvatar.displayName = 'Message.Avatar';
