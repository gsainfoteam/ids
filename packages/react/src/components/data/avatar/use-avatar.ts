import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export type AvatarStatus = 'loading' | 'loaded' | 'error';

type Reported = { src: string | undefined; status: AvatarStatus };

function initialStatus(src: string | undefined): AvatarStatus {
  return src ? 'loading' : 'error';
}

export function useAvatarStatus(
  src: string | undefined,
  onStatusChange: ((status: AvatarStatus) => void) | undefined,
) {
  const [reported, setReported] = useState<Reported>({ src, status: initialStatus(src) });
  const status = reported.src === src ? reported.status : initialStatus(src);

  const currentSrc = useRef(src);
  useLayoutEffect(() => {
    currentSrc.current = src;
  });
  const report = useCallback((from: string, next: AvatarStatus) => {
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

function settleSizelessImage(image: HTMLImageElement, settle: (status: AvatarStatus) => void) {
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
  report: (src: string, status: AvatarStatus) => void,
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

export function useFallbackVisible(status: AvatarStatus, src: string | undefined, delay: number) {
  const [elapsedFor, setElapsedFor] = useState<{ src: string | undefined } | null>(null);
  useEffect(() => {
    if (status !== 'loading' || delay <= 0) return;
    const timer = window.setTimeout(() => setElapsedFor({ src }), delay);
    return () => window.clearTimeout(timer);
  }, [status, src, delay]);

  if (status === 'error') return true;
  if (status === 'loaded') return false;
  return delay <= 0 || (elapsedFor !== null && elapsedFor.src === src);
}
