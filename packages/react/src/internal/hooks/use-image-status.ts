'use client';

import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';

import { initialImageStatus, type ImageStatus } from '../lib/image-status';

type Reported = { src: string | undefined; status: ImageStatus };

export function useInternalImageStatus(
  src: string | undefined,
  onStatusChange: ((status: ImageStatus) => void) | undefined,
) {
  const [reported, setReported] = useState<Reported>({ src, status: initialImageStatus(src) });
  const status = reported.src === src ? reported.status : initialImageStatus(src);

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

  const notify = useEffectEvent((next: ImageStatus) => onStatusChange?.(next));
  useEffect(() => {
    notify(status);
  }, [status]);

  return { status, report };
}
