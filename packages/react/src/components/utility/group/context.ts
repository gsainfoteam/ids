'use client';

import { createContext, use } from 'react';

import type { SurfaceVariant } from '../../../internal/surfaces/lib/control-surface';
import type { IdsSize } from '../../../tokens/types';

export type GroupOrientation = 'horizontal' | 'vertical';

export type GroupContextValue = {
  orientation: GroupOrientation;
  size?: IdsSize;
  variant?: SurfaceVariant;
  separator: 'semantic' | 'decorative';
};

export const GroupContext = createContext<GroupContextValue | null>(null);

export function useInternalGroupContext() {
  return use(GroupContext);
}
