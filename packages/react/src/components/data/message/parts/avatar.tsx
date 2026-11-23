'use client';

import { Avatar } from '../../avatar';
import { useInternalMessageContext } from '../context';

export type MessageAvatarProps = Avatar.Props;

export function MessageAvatar(props: MessageAvatarProps) {
  const { styles, name } = useInternalMessageContext('Message.Avatar');

  return (
    <span aria-hidden="true" data-message-avatar="" className={styles.avatar()}>
      <Avatar name={name} {...props} />
    </span>
  );
}

MessageAvatar.displayName = 'Message.Avatar';
