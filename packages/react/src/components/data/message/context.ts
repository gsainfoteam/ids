'use client';

import { createContext, use, type RefObject } from 'react';

import { invariant } from '../../../utils';

import type { MessageAlign, MessageStatus } from '.';
import type { messageStyle } from './style';

type Context = {
  styles: ReturnType<typeof messageStyle>;
  align: MessageAlign;
  name: string | undefined;
  time: Date | undefined;
  locale: string | undefined;
  status: MessageStatus;
  unread: number | boolean | undefined;
  last: boolean;
  timeIn: 'header' | 'side' | 'footer';
  labelId: string;
  contentRef: RefObject<HTMLDivElement | null>;
  readContent: () => string;
};

export const MessageContext = createContext<Context | null>(null);

export function useMessageContext(part: string) {
  const context = use(MessageContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Message>\`.`);
  return context;
}

export type MessageGroupPosition = {
  align: MessageAlign | undefined;
  first: boolean;
  last: boolean;
};

export const MessageGroupContext = createContext<MessageGroupPosition | null>(null);
