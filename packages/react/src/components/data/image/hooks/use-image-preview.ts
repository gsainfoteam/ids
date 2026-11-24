'use client';

import { use, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';

import { ImageGroupContext } from '../context';
import { loadedSizeOf } from '../lib/image-size';

import type { ImageItem } from './use-image-group';

type PreviewOptions = Pick<ImageItem, 'caption' | 'crossOrigin' | 'referrerPolicy'> & {
  preview: boolean;
  current: string | undefined;
  previewSrc: string | undefined;
  srcSet: string | undefined;
  alt: string;
  imageRef: RefObject<HTMLImageElement | null>;
};

export function useInternalImagePreview({
  preview,
  current,
  previewSrc,
  srcSet,
  alt,
  caption,
  crossOrigin,
  referrerPolicy,
  imageRef,
}: PreviewOptions) {
  const group = use(ImageGroupContext);
  const key = useId();

  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  const shown = previewSrc || current;
  const previewable = preview && group !== null && shown !== undefined;
  const register = group?.register;

  const itemNow = (): ImageItem => ({
    src: shown ?? '',
    srcSet: previewSrc ? undefined : srcSet,
    sizes: undefined,
    thumbnail: current,
    thumbnailSize: loadedSizeOf(imageRef.current),
    alt,
    caption,
    crossOrigin,
    referrerPolicy,
  });
  const latestItem = useRef(itemNow);
  useLayoutEffect(() => {
    latestItem.current = itemNow;
  });

  useLayoutEffect(() => {
    if (!previewable || !register || !frame) return;
    return register({ key, element: frame, trigger, item: () => latestItem.current() });
  }, [previewable, register, key, frame, trigger]);

  const index = group?.entries.findIndex((entry) => entry.key === key) ?? -1;
  const expanded = previewable && group !== null && group.open && index === group.value;

  return {
    previewable,
    expanded,
    setFrame,
    setTrigger,
    openViewer: () => group?.openAt(key),
  };
}
