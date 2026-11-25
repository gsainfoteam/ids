'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalDrawerNameWarning(
  content: HTMLElement | null,
  props: { 'aria-labelledby'?: string },
) {
  useEffect(() => {
    if (!isDevelopment || !content) return;

    const named =
      content.hasAttribute('aria-label') ||
      !!props['aria-labelledby'] ||
      !!content.querySelector('[data-drawer-title]');

    if (!named)
      console.warn(
        '[IDS] Drawer: add Drawer.Title, or aria-label on Drawer.Content, so screen readers can name the drawer.',
      );
  }, [content, props]);
}
