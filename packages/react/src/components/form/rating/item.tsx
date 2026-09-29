'use client';

import { type CSSProperties, type ReactNode } from 'react';

import { invariant } from '../../../utils';

import type { RatingItemState } from '.';
import type { StateProp } from './state-prop';

export type RatingItemProps = {
  index?: number;
  className?: StateProp<string | undefined, RatingItemState>;
  style?: StateProp<CSSProperties | undefined, RatingItemState>;
  children?: ReactNode | ((state: RatingItemState) => ReactNode);
};

export function RatingItem(_props: RatingItemProps): ReactNode {
  invariant(false, 'Rating.Item must be a direct child of Rating (or inside a Fragment).');
}

RatingItem.displayName = 'Rating.Item';
