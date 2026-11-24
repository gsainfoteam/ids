'use client';

import { useEffect, type RefObject } from 'react';

import { editorRootOf } from '../drag-handle/geometry';

import type { BlockHoverStore } from '../drag-handle/store';

export function useInternalEditorBlockHandleLeave(
  store: BlockHoverStore,
  handleRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    const handle = handleRef.current;
    const area = handle && editorRootOf(handle);
    if (!handle || !area) return;
    const forget = (event: PointerEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && (area.contains(next) || handle.contains(next))) return;
      store.set(null);
    };
    area.addEventListener('pointerleave', forget);
    handle.addEventListener('pointerleave', forget);
    return () => {
      area.removeEventListener('pointerleave', forget);
      handle.removeEventListener('pointerleave', forget);
    };
  }, [store, handleRef]);
}
