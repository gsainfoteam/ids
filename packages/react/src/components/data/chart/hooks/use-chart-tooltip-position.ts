'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

import { showInTopLayer, useInternalAnchored } from '../../../../internal/overlay';
import { pointIn } from '../lib/tooltip-point';

type TooltipPositionOptions = {
  open: boolean;
  frameRef: RefObject<HTMLDivElement | null>;
  x: number | undefined;
  y: number | undefined;
};

const GAP_FROM_THE_POINT = 12;

export function useInternalChartTooltipPosition({ open, frameRef, x, y }: TooltipPositionOptions) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);

  const anchored = useInternalAnchored({
    open,
    reference: frameRef,
    floating: box,
    side: 'right',
    align: 'start',
    sideOffset: GAP_FROM_THE_POINT,
    glide: true,
  });
  const { setPositionReference } = anchored.refs;

  useLayoutEffect(() => {
    if (x !== undefined && y !== undefined) setPositionReference(pointIn(frameRef, x, y));
  }, [frameRef, x, y, setPositionReference]);

  useLayoutEffect(() => {
    if (box?.isConnected) showInTopLayer(box);
  }, [box]);

  return { setBox, anchored };
}
