'use client';

import { use, useLayoutEffect } from 'react';

import { OverlayItemContext } from '../context';

export function useInternalOverlayItem(controlledOpen: boolean | undefined) {
  const item = use(OverlayItemContext);
  const bound = controlledOpen === undefined ? item : null;

  useLayoutEffect(() => bound?.bind(), [bound]);

  return bound;
}
