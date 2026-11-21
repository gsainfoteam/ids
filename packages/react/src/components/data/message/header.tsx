'use client';

import { type ComponentProps } from 'react';

import { useMessageContext } from './context';
import { MessageTime } from './time';

export type MessageHeaderProps = ComponentProps<'header'>;

export function MessageHeader({ className, children, ...props }: MessageHeaderProps) {
  const { styles, name, time, timeIn, status, labelId } = useMessageContext('Message.Header');
  const custom = children != null;

  return (
    <header
      {...props}
      id={custom ? labelId : props.id}
      data-message-header=""
      className={styles.header({ className })}
    >
      {custom ? (
        children
      ) : (
        <>
          {name !== undefined && (
            <span id={labelId} className={styles.name()}>
              {name}
            </span>
          )}
          {timeIn === 'header' && status !== 'error' && time !== undefined && (
            <MessageTime time={time} />
          )}
        </>
      )}
    </header>
  );
}

MessageHeader.displayName = 'Message.Header';
