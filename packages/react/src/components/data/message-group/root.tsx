'use client';

import { isValidElement } from 'react';

import { messageGroupStyle } from './style';
import { flattenFragments } from '../../../utils';
import { MessageGroupContext } from '../message/context';

import type { MessageGroup } from '.';

export function MessageGroupRoot({ align, className, children, ...props }: MessageGroup.Props) {
  const items = flattenFragments(children);
  const messages = items.filter((item) => isValidElement(item));

  return (
    <div
      role="group"
      {...props}
      data-message-group=""
      data-align={align}
      className={messageGroupStyle({ className })}
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
