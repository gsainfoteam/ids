'use client';

import { useRef, useState } from 'react';

import { useInternalPresence } from '../../../../internal/overlay';

export function useInternalMessageUnread(showing: boolean, unread: number | boolean | undefined) {
  const ref = useRef<HTMLSpanElement>(null);
  const [lastShown, setLastShown] = useState(showing ? unread : undefined);
  if (showing && lastShown !== unread) setLastShown(unread);
  const { mounted, ending } = useInternalPresence(showing, { elements: () => [ref.current] });

  return { ref, lastShown, mounted, ending };
}
