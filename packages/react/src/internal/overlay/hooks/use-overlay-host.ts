'use client';

import { useLayoutEffect, useState, useSyncExternalStore } from 'react';

import { overlayHosts, overlayItems, registerOverlayHost, type OverlayItem } from '../lib/store';

const NO_ITEMS: readonly OverlayItem[] = [];

export function useInternalOverlayHost() {
  const [host] = useState(() => Symbol('overlay host'));

  useLayoutEffect(() => registerOverlayHost(host), [host]);

  const elected = useSyncExternalStore(
    overlayHosts.subscribe,
    () => overlayHosts.get()[0] === host,
    () => false,
  );
  const items = useSyncExternalStore(overlayItems.subscribe, overlayItems.get, () => NO_ITEMS);

  return elected ? items : NO_ITEMS;
}
