'use client';

import { useState, useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

const subscribeToNothing = () => noop;
const onTheClient = () => true;
const notOnTheServer = () => false;

export function useInternalImageViewerGate(open: boolean) {
  const mounted = useSyncExternalStore(subscribeToNothing, onTheClient, notOnTheServer);
  const [opened, setOpened] = useState(open);

  if (open && !opened) setOpened(true);
  return mounted && opened;
}
