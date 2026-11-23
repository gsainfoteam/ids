'use client';

import { useCallback, useRef, type Ref, type RefCallback } from 'react';

import {
  useInternalImageSettledBeforeMount,
  type ImageStatus,
} from '../../../../internal/lib/image-status';
import { mergeRefs } from '../../../../utils';

export function useInternalAvatarPicture(
  current: string | undefined,
  report: (src: string, status: ImageStatus) => void,
  ref: Ref<HTMLImageElement> | undefined,
) {
  const imageRef = useRef<HTMLImageElement>(null);
  const mergedRef: RefCallback<HTMLImageElement> = useCallback(
    (node: HTMLImageElement | null) => mergeRefs(imageRef, ref)(node),
    [ref],
  );
  useInternalImageSettledBeforeMount(imageRef, current, report);

  return mergedRef;
}
