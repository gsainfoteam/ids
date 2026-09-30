'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export type ImageStatus = 'loading' | 'loaded' | 'error';

type Reported = { src: string | undefined; status: ImageStatus };

function initialStatus(src: string | undefined): ImageStatus {
  return src ? 'loading' : 'error';
}

export function useImageStatus(
  src: string | undefined,
  onStatusChange: ((status: ImageStatus) => void) | undefined,
) {
  const [reported, setReported] = useState<Reported>({ src, status: initialStatus(src) });
  const status = reported.src === src ? reported.status : initialStatus(src);

  const currentSrc = useRef(src);
  useLayoutEffect(() => {
    currentSrc.current = src;
  });
  const report = useCallback((from: string, next: ImageStatus) => {
    if (from !== currentSrc.current) return;
    setReported((prev) =>
      prev.src === from && prev.status === next ? prev : { src: from, status: next },
    );
  }, []);

  const notify = useRef(onStatusChange);
  useLayoutEffect(() => {
    notify.current = onStatusChange;
  });
  useEffect(() => {
    notify.current?.(status);
  }, [status]);

  return { status, report };
}

function settleSizelessImage(image: HTMLImageElement, settle: (status: ImageStatus) => void) {
  if (typeof image.decode !== 'function') {
    settle('error');
    return;
  }
  image.decode().then(
    () => settle('loaded'),
    () => settle('error'),
  );
}

export function useImageSettledBeforeMount(
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
