import { createContext, useContext } from 'react';

import type { IdsSize } from '../../tokens/types';

export const FieldSizeContext = createContext<IdsSize | undefined>(undefined);

/** Explicit control sizes take priority over the containing Field. */
export function useFieldSize(size?: IdsSize) {
  const inherited = useContext(FieldSizeContext);
  return size ?? inherited;
}
