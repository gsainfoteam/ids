'use client';

import { useLayoutEffect } from 'react';

export function useInternalMessageScrollerListChange(scroll: { contentChanged: () => void }) {
  useLayoutEffect(() => {
    scroll.contentChanged();
  });
}
