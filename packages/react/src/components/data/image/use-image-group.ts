'use client';

import { useCallback, useState, type ComponentProps, type ReactNode } from 'react';

import { useControllableState } from '../../../hooks/use-controllable-state';

export type NaturalSize = { width: number; height: number };

export type ImageItem = {
  src: string;
  srcSet: string | undefined;
  sizes: string | undefined;
  thumbnail: string | undefined;
  thumbnailSize: NaturalSize | undefined;
  alt: string;
  caption: ReactNode;
  crossOrigin: ComponentProps<'img'>['crossOrigin'];
  referrerPolicy: ComponentProps<'img'>['referrerPolicy'];
};

export type ViewerItem = ImageItem & { key: string };

export type ImageGroupEntry = {
  key: string;
  element: HTMLElement;
  trigger: HTMLElement | null;
  item: () => ImageItem;
};

export type UseImageGroupOptions = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  loop?: boolean;
};

const FITTED_ZOOM = 1;

const earlierInDocument = (a: ImageGroupEntry, b: ImageGroupEntry) =>
  a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

const inDocumentOrder = (entries: readonly ImageGroupEntry[]) =>
  [...entries].sort(earlierInDocument);

const sameOrder = (a: readonly ImageGroupEntry[], b: readonly ImageGroupEntry[]) =>
  a.length === b.length && a.every((entry, index) => entry === b[index]);

export function useImageGroup(options: UseImageGroupOptions) {
  const [value, setValue] = useControllableState({
    value: options.value,
    defaultValue: options.defaultValue ?? 0,
    onValueChange: options.onValueChange,
  });
  const [open, setOpen] = useControllableState({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onValueChange: options.onOpenChange,
  });
  const [zoom, setZoom] = useControllableState({
    value: options.zoom,
    defaultValue: FITTED_ZOOM,
    onValueChange: options.onZoomChange,
  });
  const [entries, setEntries] = useState<readonly ImageGroupEntry[]>([]);
  const [opener, setOpener] = useState<HTMLElement | null>(null);

  const register = useCallback((entry: ImageGroupEntry) => {
    setEntries((current) =>
      inDocumentOrder([...current.filter((other) => other.key !== entry.key), entry]),
    );

    return () => setEntries((current) => current.filter((other) => other.key !== entry.key));
  }, []);

  const openAt = (key: string) => {
    const ordered = inDocumentOrder(entries);
    const index = ordered.findIndex((entry) => entry.key === key);
    if (index < 0) return;

    if (!sameOrder(ordered, entries)) setEntries(ordered);
    setOpener(ordered[index]!.trigger);
    setZoom(FITTED_ZOOM);
    setValue(index);
    setOpen(true);
  };

  return {
    entries,
    value,
    setValue,
    open,
    setOpen,
    zoom,
    setZoom,
    loop: options.loop ?? false,
    opener,
    register,
    openAt,
  };
}

export type ImageGroupState = ReturnType<typeof useImageGroup>;
