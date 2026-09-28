import type { ReactNode } from 'react';

import { createExternalStore } from './external-store';

import type { ThemeContextValue } from '../../components/utility/ids-provider/use-ids-provider';

export type OverlayControls<T> = {
  id: string;
  isOpen: boolean;
  close: (value?: T) => void;
  unmount: () => void;
};

export type OverlayRender<T> = (controls: OverlayControls<T>) => ReactNode;

export type OverlayOptions = { id?: string; theme?: ThemeContextValue };

export type OverlayItem = {
  id: string;
  open: boolean;
  render: OverlayRender<unknown>;
  theme: ThemeContextValue | undefined;
};

export const overlayItems = createExternalStore<readonly OverlayItem[]>([]);
export const overlayHosts = createExternalStore<readonly symbol[]>([]);

const resolvers = new Map<string, (value: unknown) => void>();
let opened = 0;

function settle(id: string, value: unknown) {
  const resolve = resolvers.get(id);
  resolvers.delete(id);
  resolve?.(value);
}

function keep(matches: (item: OverlayItem) => boolean) {
  const items = overlayItems.get();
  const kept = items.filter(matches);
  if (kept.length !== items.length) overlayItems.set(kept);
}

function open<T>(render: OverlayRender<T>, { id, theme }: OverlayOptions = {}) {
  const key = id ?? `ids-overlay-${++opened}`;
  return new Promise<T | undefined>((resolve) => {
    settle(key, undefined);
    resolvers.set(key, resolve as (value: unknown) => void);
    const items = overlayItems.get();
    const reopened = { id: key, open: true, render: render as OverlayRender<unknown> };
    overlayItems.set(
      items.some((item) => item.id === key)
        ? items.map((item) =>
            item.id === key ? { ...reopened, theme: theme ?? item.theme } : item,
          )
        : [...items, { ...reopened, theme }],
    );
  });
}

function close(id: string, value?: unknown) {
  settle(id, value);
  const items = overlayItems.get();
  if (items.some((item) => item.id === id && item.open))
    overlayItems.set(items.map((item) => (item.id === id ? { ...item, open: false } : item)));
}

function closeAll() {
  for (const item of overlayItems.get()) if (item.open) close(item.id);
}

function unmount(id: string) {
  settle(id, undefined);
  keep((item) => item.id !== id);
}

export function removeClosed(id: string) {
  keep((item) => item.id !== id || item.open);
}

const layersBoundToItem = new Map<string, number>();

export function bindLayer(id: string) {
  layersBoundToItem.set(id, (layersBoundToItem.get(id) ?? 0) + 1);
  return () => {
    const remaining = (layersBoundToItem.get(id) ?? 1) - 1;
    if (remaining > 0) layersBoundToItem.set(id, remaining);
    else layersBoundToItem.delete(id);
  };
}

export function removeIfNothingExits(id: string) {
  if (!layersBoundToItem.has(id)) removeClosed(id);
}

function dropEverything() {
  for (const id of [...resolvers.keys()]) settle(id, undefined);
  overlayItems.set([]);
}

export function registerOverlayHost(host: symbol) {
  overlayHosts.set([...overlayHosts.get(), host]);
  return () => {
    overlayHosts.set(overlayHosts.get().filter((registered) => registered !== host));
    queueMicrotask(() => {
      const remountedInTheSameTask = overlayHosts.get().length > 0;
      if (!remountedInTheSameTask) dropEverything();
    });
  };
}

export const overlay = { open, close, closeAll, unmount };
