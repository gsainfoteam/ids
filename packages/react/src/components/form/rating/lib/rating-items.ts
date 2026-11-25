import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { elementTypeOf, flattenFragments, invariant } from '../../../../utils';
import { RatingItem, type RatingItemProps } from '../parts/item';

export function ratingItemsIn(children: ReactNode, max: number) {
  let template: ReactElement<RatingItemProps> | undefined;
  const indexed = new Map<number, ReactElement<RatingItemProps>>();
  for (const child of flattenFragments(children)) {
    invariant(
      isValidElement<RatingItemProps>(child) && elementTypeOf(child) === RatingItem,
      'Rating children must be Rating.Item elements.',
    );
    const { index } = child.props;
    if (index === undefined) {
      invariant(template === undefined, 'Rating takes one Rating.Item without an index.');
      template = child;
      continue;
    }
    invariant(
      Number.isInteger(index) && index >= 0 && index < max && !indexed.has(index),
      'Rating.Item index must be unique and between 0 and max - 1.',
    );
    indexed.set(index, child);
  }
  return { template, indexed };
}
