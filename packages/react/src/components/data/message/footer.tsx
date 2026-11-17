'use client';

import { type ComponentProps } from 'react';

import { useMessageContext } from './context';
import { MessageTime } from './time';
import { useTranslate } from '../../../internal/translate';

import type { MessageStatus } from '.';

export type MessageFooterProps = ComponentProps<'footer'>;

const STATUS_TEXT = {
  pending: 'message.pending',
  read: 'message.read',
} as const satisfies Partial<Record<MessageStatus, string>>;

function hasStatusText(status: MessageStatus): status is keyof typeof STATUS_TEXT {
  return status in STATUS_TEXT;
}

export function MessageFooter({ className, children, ...props }: MessageFooterProps) {
  const t = useTranslate();
  const { styles, time, status, last } = useMessageContext('Message.Footer');
  const shownTime = last ? time : undefined;
  const statusText = hasStatusText(status) ? t(STATUS_TEXT[status]) : undefined;

  if (children == null && shownTime === undefined && statusText === undefined) return null;

  return (
    <footer {...props} data-message-footer="" className={styles.footer({ className })}>
      {children ?? (
        <>
          {shownTime !== undefined && <MessageTime time={shownTime} />}
          {shownTime !== undefined && statusText !== undefined && <span aria-hidden="true">·</span>}
          {statusText !== undefined && <span>{statusText}</span>}
        </>
      )}
    </footer>
  );
}

MessageFooter.displayName = 'Message.Footer';
