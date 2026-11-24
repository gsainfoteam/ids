'use client';

import { createContext, use, type RefObject } from 'react';

import { invariant } from '../../../utils';

import type { ChartConfig } from './lib/config';
import type { ChartTableModel } from './lib/graph';
import type { chartStyle } from './style';

type Context = {
  config: ChartConfig;
  styles: ReturnType<typeof chartStyle>;
  locale: string;
  titleId: string | undefined;
  descriptionId: string | undefined;
  table: ChartTableModel | undefined;
  frameRef: RefObject<HTMLDivElement | null>;
};

export const ChartContext = createContext<Context | null>(null);

export function useInternalChartContext(part: string) {
  const context = use(ChartContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Chart>\`.`);
  return context;
}
