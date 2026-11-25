'use client';

import { useCallback } from 'react';

import type { useInternalScrollArea } from './use-scroll-area';
import type { Axis, Placement } from '../lib/geometry';

export function useInternalScrollAreaBarRegister(
  registerBar: ReturnType<typeof useInternalScrollArea>['registerBar'] | undefined,
  axis: Axis,
  placement: Placement,
) {
  return useCallback(
    (node: HTMLDivElement | null) =>
      node && registerBar ? registerBar(axis, node, placement) : undefined,
    [registerBar, axis, placement],
  );
}
