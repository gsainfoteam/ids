import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { cardStyle } from './style';

type Context = {
  styles: ReturnType<typeof cardStyle>;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
};

export const CardContext = createContext<Context | null>(null);

export function useCardContext(part: string) {
  const context = use(CardContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Card>\`.`);
  return context;
}
