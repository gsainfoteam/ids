'use client';

import { useState } from 'react';

import type { CommandPalette } from './use-command';

export function useInternalMenuSection(palette: CommandPalette | null) {
  const [element, setElement] = useState<HTMLElement | null>(null);

  return {
    ref: palette ? setElement : undefined,
    hidden: !!element && !!palette?.hiddenSections.has(element),
  };
}
