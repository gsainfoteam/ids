'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { CircularProgress } from '.';
import type { circularProgressStyle } from './style';

type Context = {
  state: CircularProgress.State;
  styles: ReturnType<typeof circularProgressStyle>;
  labelId: string;
};

export const CircularProgressContext = createContext<Context | null>(null);

export function useInternalCircularProgressContext(part: string) {
  const context = use(CircularProgressContext);
  invariant(context, `${part} must be rendered inside CircularProgress.`);
  return context;
}
