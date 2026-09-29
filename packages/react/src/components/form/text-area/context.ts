'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { textAreaStyle } from './style';
import type { useTextArea } from './use-text-area';

type TextAreaContextValue = {
  inputProps: ReturnType<typeof useTextArea>['inputProps'];
  count: ReturnType<typeof useTextArea>['count'];
  countId: string;
  autoResize: boolean;
  minRows?: number;
  maxRows?: number;
  styles: ReturnType<typeof textAreaStyle>;
};

export const TextAreaContext = createContext<TextAreaContextValue | null>(null);

export function useTextAreaContext(part: string) {
  const context = use(TextAreaContext);
  invariant(context != null, `\`<${part}>\` must be used inside \`<TextArea>\`.`);
  return context;
}
