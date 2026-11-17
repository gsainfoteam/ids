'use client';

import { createContext, use, type ReactNode, type RefObject } from 'react';

import { invariant } from '../../../utils';

import type { MessageAlign, MessageFrom, MessageStatus } from '.';
import type { messageStyle } from './style';

type Context = {
  styles: ReturnType<typeof messageStyle>;
  from: MessageFrom;
  align: MessageAlign;
  name: string | undefined;
  avatar: string | ReactNode;
  time: Date | undefined;
  locale: string | undefined;
  status: MessageStatus;
  last: boolean;
  timeIn: 'header' | 'footer';
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
