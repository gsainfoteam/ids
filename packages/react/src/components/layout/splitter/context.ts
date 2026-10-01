'use client';

import { createContext, use, type Context } from 'react';

import { invariant } from '../../../utils';

import type { splitterStyle } from './style';
import type { SplitterOrientation, useSplitter } from './use-splitter';

type SplitterContextValue = {
  orientation: SplitterOrientation;
  styles: ReturnType<typeof splitterStyle>;
  splitter: ReturnType<typeof useSplitter>;
};

export const SplitterContext = createContext<SplitterContextValue | null>(null);
export const PanelIndexContext = createContext<number | null>(null);
export const HandleIndexContext = createContext<number | null>(null);

export function useSplitterPart(part: string, indexContext: Context<number | null>) {
  const context = use(SplitterContext);
  invariant(context, `${part} must be rendered inside Splitter.`);
  const index = use(indexContext);
  invariant(index !== null, `${part} must be a direct child of Splitter; fragments are fine.`);
  return { ...context, index };
}
