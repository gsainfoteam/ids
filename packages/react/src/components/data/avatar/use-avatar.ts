'use client';

import { useEffect, useState } from 'react';

import type { ImageStatus } from '../../../internal/image-status';

export type AvatarStatus = ImageStatus;

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
