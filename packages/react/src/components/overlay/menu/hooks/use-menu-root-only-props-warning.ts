'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalMenuRootOnlyPropsWarning(setsRootOnlyProps: boolean) {
  useEffect(() => {
    if (isDevelopment && setsRootOnlyProps)
      console.warn(
        '[IDS] Menu: triggerType and hotkey apply only to the outermost Menu. A Menu inside Menu.Content is a submenu and ignores them.',
      );
  }, [setsRootOnlyProps]);
}
