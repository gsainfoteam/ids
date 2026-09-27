import { createContext } from 'react';

import type { IdsSize } from '../../../tokens/types';

export type AvatarShape = 'circle' | 'square';

// Which side of an avatar another avatar overlaps in a stack. That side gets a transparent
// cut-out, so the gap between the two shows whatever is behind the group.
export type AvatarCutout = 'start' | 'end';

export type AvatarGroupContextValue = {
  size: IdsSize;
  shape: AvatarShape;
};

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null);

export const AvatarCutoutContext = createContext<AvatarCutout | undefined>(undefined);
