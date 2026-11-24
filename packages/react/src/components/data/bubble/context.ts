'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { BubbleAlign } from '.';
import type { bubbleStyle } from './style';

type Context = {
  styles: ReturnType<typeof bubbleStyle>;
  overlap: boolean;
};

export const BubbleContext = createContext<Context | null>(null);

export function useInternalBubbleContext(part: string) {
  const context = use(BubbleContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Bubble>\`.`);
  return context;
}

export const BubbleAlignContext = createContext<BubbleAlign | undefined>(undefined);
