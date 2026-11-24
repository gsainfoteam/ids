'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { useInternalTextArea } from './hooks/use-text-area';
import type { useInternalTextAreaResize } from './hooks/use-text-area-resize';
import type { textAreaStyle } from './style';

type TextAreaContextValue = {
  inputProps: ReturnType<typeof useInternalTextArea>['inputProps'];
  count: ReturnType<typeof useInternalTextArea>['count'];
  countId: string;
  autoResize: boolean;
  minRows?: number;
  maxRows?: number;
  resize: Pick<ReturnType<typeof useInternalTextAreaResize>, 'height' | 'setInput'>;
  styles: ReturnType<typeof textAreaStyle>;
};

export const TextAreaContext = createContext<TextAreaContextValue | null>(null);

export function useInternalTextAreaContext(part: string) {
  const context = use(TextAreaContext);
  invariant(context != null, `\`<${part}>\` must be used inside \`<TextArea>\`.`);
  return context;
}
