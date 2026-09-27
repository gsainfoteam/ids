import { createContext } from 'react';

import type { IdsSize } from '../../../tokens/types';

export type AvatarShape = 'circle' | 'square';

export type AvatarCutout = 'start' | 'end';

export type AvatarGroupContextValue = {
  size: IdsSize;
  shape: AvatarShape;
};

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export const AvatarCutoutContext = createContext<AvatarCutout | undefined>(undefined);
