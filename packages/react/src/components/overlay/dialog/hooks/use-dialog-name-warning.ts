'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalDialogNameWarning(
  content: HTMLElement | null,
  props: { 'aria-labelledby'?: string },
) {
  useEffect(() => {
    if (!isDevelopment || !content) return;

    const named =
      content.hasAttribute('aria-label') ||
      !!props['aria-labelledby'] ||
      !!content.querySelector('[data-dialog-title]');

    if (!named)
      console.warn(
        '[IDS] Dialog: add Dialog.Title, or aria-label on Dialog.Content, so screen readers can name the dialog.',
      );
  }, [content, props]);
}
