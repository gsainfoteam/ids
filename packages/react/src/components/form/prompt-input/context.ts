'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { PromptInputStatus } from './root';
import type { promptInputStyle } from './style';
import type { IdsSize } from '../../../tokens/types';

type PromptInputContextValue = {
  status: PromptInputStatus;
  busy: boolean;
  canSend: boolean;
  stop: (() => void) | undefined;
  disabled: boolean;
  size: IdsSize;
  styles: ReturnType<typeof promptInputStyle>;
};

export const PromptInputContext = createContext<PromptInputContextValue | null>(null);

export function usePromptInputContext(part: string) {
  const context = use(PromptInputContext);
  invariant(context != null, `\`<${part}>\` must be used inside \`<PromptInput>\`.`);
  return context;
}
