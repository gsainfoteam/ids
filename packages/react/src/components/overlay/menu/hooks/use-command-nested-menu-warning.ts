'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalCommandNestedMenuWarning() {
  useEffect(() => {
    if (isDevelopment)
      console.warn(
        '[IDS] Menu: a Menu nested in a triggerType="command" palette is not supported and renders nothing. Put its items in a Menu.Group instead.',
      );
  }, []);
}
