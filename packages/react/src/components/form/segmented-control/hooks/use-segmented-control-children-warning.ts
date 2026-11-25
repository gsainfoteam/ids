'use client';

import { useEffect, type ReactNode } from 'react';

import { isDevelopment } from '../../../../utils/dev';
import { holdsOnlyItems } from '../lib/items';

export function useInternalSegmentedControlChildrenWarning(items: ReactNode) {
  const onlyItems = holdsOnlyItems(items);

  useEffect(() => {
    if (isDevelopment && !onlyItems)
      console.warn(
        '[IDS] SegmentedControl: put only SegmentedControl.Item inside. A segment holds its text or icon as the children of an Item.',
      );
  }, [onlyItems]);
}
