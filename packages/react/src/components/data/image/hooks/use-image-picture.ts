'use client';

import { useCallback, useRef, type Ref, type RefCallback } from 'react';

import { useInternalImageSettledBeforeMount } from '../../../../internal/hooks/use-image-settled-before-mount';
import { useInternalImageStatus } from '../../../../internal/hooks/use-image-status';
import { mergeRefs } from '../../../../utils';

import type { ImageStatus } from '../../../../internal/lib/image-status';

export function useInternalImagePicture(
  current: string | undefined,
  onStatusChange: ((status: ImageStatus) => void) | undefined,
  ref: Ref<HTMLImageElement> | undefined,
) {
  const { status, report } = useInternalImageStatus(current, onStatusChange);
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef: RefCallback<HTMLImageElement> = useCallback(
    (node: HTMLImageElement | null) => mergeRefs(imageRef, ref)(node),
    [ref],
  );
  useInternalImageSettledBeforeMount(imageRef, current, report);

  return { status, report, imageRef, mergedRef };
}
