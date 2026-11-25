'use client';

import { useEffect } from 'react';

import { isDevelopment } from '../../../../utils/dev';

export function useInternalSidebarTreeWarnings(everyRowIsAnItem: boolean, duplicates: string) {
  useEffect(() => {
    if (!isDevelopment || everyRowIsAnItem) return;
    console.warn(
      '[IDS] `<Sidebar.Group items>` places each item’s children under the row its function returns, and drags that row. Return a `<Sidebar.Item>` from the function, not a component that renders one.',
    );
  }, [everyRowIsAnItem]);

  useEffect(() => {
    if (!isDevelopment || duplicates === '') return;
    console.warn(
      `[IDS] \`<Sidebar.Group items>\` found the id ${duplicates} twice under one parent. Ids only need to differ between siblings, but there they must; the repeated items are left out.`,
    );
  }, [duplicates]);
}
