'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { emptyStyle } from './style';

type Context = {
  styles: ReturnType<typeof emptyStyle>;
};

export const EmptyContext = createContext<Context | null>(null);

export function useEmptyContext(part: string) {
  const context = use(EmptyContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Empty>\`.`);
  return context;
}
