'use client';

import { useLayoutEffect, type RefObject } from 'react';

import { settleSizelessImage, type ImageStatus } from '../lib/image-status';

export function useInternalImageSettledBeforeMount(
  imageRef: RefObject<HTMLImageElement | null>,
  src: string | undefined,
  report: (src: string, status: ImageStatus) => void,
) {
  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image || !src || !image.complete) return;
    if (image.naturalWidth > 0) {
      report(src, 'loaded');
      return;
    }
    settleSizelessImage(image, (status) => report(src, status));
  }, [imageRef, src, report]);
}
