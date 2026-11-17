'use client';

import { type ComponentProps } from 'react';

import { useMessageContext } from './context';
import { MessageTime } from './time';

export type MessageFooterProps = ComponentProps<'footer'>;

export function MessageFooter({ className, children, ...props }: MessageFooterProps) {
  const { styles, time, timeIn, last } = useMessageContext('Message.Footer');
  const shownTime = timeIn === 'footer' && last ? time : undefined;

  if (children == null && shownTime === undefined) return null;

  return (
    <footer {...props} data-message-footer="" className={styles.footer({ className })}>
      {children ?? (shownTime !== undefined && <MessageTime time={shownTime} />)}
    </footer>
  );
}

MessageFooter.displayName = 'Message.Footer';
