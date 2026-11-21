'use client';

import { isValidElement } from 'react';

import { useMessageContext } from './context';
import { Avatar } from '../avatar';

export type MessageAvatarProps = Avatar.Props;

export function MessageAvatar(props: MessageAvatarProps) {
  const { styles, avatar, name } = useMessageContext('Message.Avatar');
  const given = Object.keys(props).length > 0;

  return (
    <span aria-hidden="true" data-message-avatar="" className={styles.avatar()}>
      {isValidElement(avatar) && !given ? (
        avatar
      ) : (
        <Avatar src={typeof avatar === 'string' ? avatar : undefined} name={name} {...props} />
      )}
    </span>
  );
}

MessageAvatar.displayName = 'Message.Avatar';
