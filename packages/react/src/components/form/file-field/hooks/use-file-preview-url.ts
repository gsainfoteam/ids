'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { noop } from 'es-toolkit';

import { isImage } from '../lib/file-rules';
import { previewUrlOf, watchPreview } from '../lib/preview-store';

export function useInternalFilePreviewUrl(file: File | undefined) {
  const shown =
    file && isImage(file) && typeof URL.createObjectURL === 'function' ? file : undefined;
  const subscribe = useCallback(() => (shown ? watchPreview(shown) : noop), [shown]);
  return useSyncExternalStore(
    subscribe,
    () => (shown ? previewUrlOf(shown) : undefined),
    () => undefined,
  );
}
