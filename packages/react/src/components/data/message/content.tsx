'use client';

import { type ComponentProps } from 'react';

import { useMessageContext } from './context';
import { containsElementOfType, mergeRefs } from '../../../utils';
import { Bubble } from '../bubble';
import { BubbleRoot } from '../bubble/root';

export type MessageContentProps = ComponentProps<'div'>;

const BUBBLE = new Set<unknown>([Bubble, BubbleRoot]);

export function MessageContent({ className, children, ref, ...props }: MessageContentProps) {
  const { styles, from, align, contentRef } = useMessageContext('Message.Content');
  const wrapInBubble = from === 'user' && !containsElementOfType(children, BUBBLE);

  return (
    <div
      {...props}
      ref={mergeRefs(ref, contentRef)}
      data-message-content=""
      className={styles.content({ className })}
    >
      {wrapInBubble ? <Bubble align={align}>{children}</Bubble> : children}
    </div>
  );
}

MessageContent.displayName = 'Message.Content';
