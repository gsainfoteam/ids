'use client';

import { isValidElement, type ComponentProps } from 'react';

import { MessageGroupContext } from './context';
import { messageStyle } from './style';
import { flattenFragments } from '../../../utils';

import type { MessageAlign } from '.';

export type MessageGroupProps = ComponentProps<'div'> & { align?: MessageAlign };

export function MessageGroup({ align, className, children, ...props }: MessageGroupProps) {
  const items = flattenFragments(children);
  const messages = items.filter((item) => isValidElement(item));

  return (
    <div
      role="group"
      {...props}
      data-message-group=""
      data-align={align}
      className={messageStyle().group({ className })}
    >
      {items.map((item) => {
        if (!isValidElement(item)) return item;
        const index = messages.indexOf(item);
        return (
          <MessageGroupContext
            key={item.key ?? index}
            value={{ align, first: index === 0, last: index === messages.length - 1 }}
          >
            {item}
          </MessageGroupContext>
        );
      })}
    </div>
  );
}

MessageGroup.displayName = 'Message.Group';
