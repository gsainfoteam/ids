'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { MessageScroll, MessageScrollView } from './message-scroll';

export const MessageScrollerContext = createContext<MessageScroll | null>(null);
export const MessageScrollerViewContext = createContext<MessageScrollView>({
  atEnd: true,
  unseen: 0,
});

export function useMessageScrollerContext(part: string) {
  const scroll = use(MessageScrollerContext);
  invariant(scroll, `\`<${part}>\` must be used inside \`<MessageScroller>\`.`);
  return scroll;
}
