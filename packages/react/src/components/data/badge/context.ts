'use client';

import { createContext, use } from 'react';

import { invariant } from '../../../utils';

import type { BadgeColorScheme, BadgePlacement, BadgeVariant } from './root';
import type { IdsSize } from '../../../tokens/types';

type Context = {
  indicatorId: string;
  variant: BadgeVariant;
  colorScheme: BadgeColorScheme;
  size: IdsSize;
  placement: BadgePlacement;
};

export const BadgeContext = createContext<Context | null>(null);

export function useInternalBadgeContext(part: string) {
  const context = use(BadgeContext);
  invariant(context, `\`<${part}>\` must be used inside \`<Badge>\`.`);
  return context;
}
