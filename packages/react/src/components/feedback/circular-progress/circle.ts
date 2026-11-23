import type { ComponentProps } from 'react';

import { ARC_RADIUS } from '../../../internal/arc';

import type { CircularProgress } from '.';

export type CirclePartProps = Omit<ComponentProps<'circle'>, 'className' | 'children'> & {
  className?: string | ((state: CircularProgress.State) => string | undefined);
};

export const circleGeometry = {
  cx: '12',
  cy: '12',
  r: ARC_RADIUS,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '3',
} as const;
