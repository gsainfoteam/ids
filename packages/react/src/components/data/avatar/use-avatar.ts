import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export type AvatarStatus = 'loading' | 'loaded' | 'error';

type Reported = { src: string | undefined; status: AvatarStatus };

function initialStatus(src: string | undefined): AvatarStatus {
  return src ? 'loading' : 'error';
}

// The status belongs to one src. A new src starts over at "loading" without an effect, and a late
// load or error event from a previous src is ignored instead of overwriting the current one.
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

// An image that finished before React attached onLoad (a cached image, or one the browser loaded
// from server-rendered HTML before hydration) fires no event React can hear, so a complete image is
// read on mount. An SVG without intrinsic size reports a zero width even when it loaded, which is
// why decode() settles that case.
export function useImageSettled(
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
    if (typeof image.decode !== 'function') {
      report(src, 'error');
      return;
    }
    image.decode().then(
      () => report(src, 'loaded'),
      () => report(src, 'error'),
    );
  }, [imageRef, src, report]);
}

// While an image is loading the fallback waits, so an image that arrives quickly never shows
// initials first. A missing or broken image shows the fallback at once.
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
