import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { Progress } from '.';
import type { progressStyle } from './style';

type Context = {
  state: Progress.State;
  styles: ReturnType<typeof progressStyle>;
  labelId: string;
  progressbar: Record<string, unknown>;
};

export const ProgressContext = createContext<Context | null>(null);

export function useProgressContext(part: string) {
  const context = use(ProgressContext);
  invariant(context, `${part} must be rendered inside Progress.`);
  return context;
}
