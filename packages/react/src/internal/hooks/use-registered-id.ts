'use client';

import { useCallback, useId, useLayoutEffect } from 'react';

export function useInternalRegisteredId(
  register: ((id: string | undefined) => void) | undefined,
  own?: string,
) {
  const generated = useId();
  const id = own ?? generated;
  const stable = useCallback((value: string | undefined) => register?.(value), [register]);
  useLayoutEffect(() => {
    stable(id);
    return () => stable(undefined);
  }, [id, stable]);
  return id;
}
