'use client';

import { type ComponentProps } from 'react';

import { mergeRefs } from '../../../../utils';
import { useInternalMessageContext } from '../context';

export type MessageContentProps = ComponentProps<'div'>;

export function MessageContent({ className, children, ref, ...props }: MessageContentProps) {
  const { styles, contentRef } = useInternalMessageContext('Message.Content');

  return (
    <div
      {...props}
      ref={mergeRefs(ref, contentRef)}
      data-message-content=""
      className={styles.content({ className })}
    >
      {children}
    </div>
  );
}

MessageContent.displayName = 'Message.Content';
