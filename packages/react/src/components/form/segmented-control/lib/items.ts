import { isValidElement, type ReactNode } from 'react';

import { elementTypeOf, flattenFragments } from '../../../../utils/children';
import { SegmentedControlItem } from '../parts/item';

const isItem = (node: ReactNode) =>
  isValidElement(node) && elementTypeOf(node) === SegmentedControlItem;

export const holdsOnlyItems = (children: ReactNode) =>
  flattenFragments(children).every(
    (child) => child === null || typeof child === 'boolean' || isItem(child),
  );
