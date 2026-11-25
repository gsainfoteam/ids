'use client';

import { useLayoutEffect } from 'react';

import type { CommandPalette } from './use-command';

export function useInternalCommandListSync({
  query,
  syncList,
  highlightFirst,
}: Pick<CommandPalette, 'query' | 'syncList' | 'highlightFirst'>) {
  useLayoutEffect(() => syncList());

  useLayoutEffect(() => highlightFirst(), [query, highlightFirst]);
}
