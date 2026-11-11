'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { codeBlockStyle } from './style';

type Context = {
  code: string;
  styles: ReturnType<typeof codeBlockStyle>;
};

export const CodeBlockContext = createContext<Context | null>(null);

export function useCodeBlockContext(part: string) {
  const context = use(CodeBlockContext);
  invariant(context, `\`<${part}>\` must be used inside \`<CodeBlock>\`.`);
  return context;
}
