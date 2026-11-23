'use client';

import { useControllableState } from '../../../../hooks/use-controllable-state';

import type { SnapPoint } from '../lib/drawer-gesture';

export type DrawerSnapOptions = {
  points: readonly SnapPoint[];
  fadeFrom?: number;
  value?: SnapPoint;
  defaultValue?: SnapPoint;
  onValueChange?: (value: SnapPoint) => void;
};

export type UseDrawerOptions = {
  snap?: DrawerSnapOptions;
};

export type DrawerSnap = {
  points: readonly SnapPoint[];
  fadeFrom: number | undefined;
  value: SnapPoint;
  setValue: (value: SnapPoint) => void;
};

export type DrawerController = {
  snap: DrawerSnap | null;
};

export function useDrawer({ snap }: UseDrawerOptions = {}): DrawerController {
  const firstPoint = snap?.points[0];

  const [value, setValue] = useControllableState<SnapPoint | undefined>({
    value: snap?.value,
    defaultValue: snap?.defaultValue ?? firstPoint,
    onValueChange: (next) => {
      if (next !== undefined) snap?.onValueChange?.(next);
    },
  });

  if (!snap || firstPoint === undefined) return { snap: null };

  return {
    snap: {
      points: snap.points,
      fadeFrom: snap.fadeFrom,
      value: value ?? firstPoint,
      setValue,
    },
  };
}
