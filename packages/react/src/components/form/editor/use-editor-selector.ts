'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

import { isEqual, noop } from 'es-toolkit';

import type { Editor as TiptapEditor } from '@tiptap/core';

export function useEditorSelector<T>(
  editor: TiptapEditor | null,
  select: (editor: TiptapEditor) => T,
  beforeTheEngineMounts: T,
): T {
  const lastSelected = useRef(beforeTheEngineMounts);

  const subscribe = useCallback(
    (notify: () => void) => {
      if (!editor) return noop;
      editor.on('transaction', notify);
      return () => {
        editor.off('transaction', notify);
      };
    },
    [editor],
  );

  const selectTheSameObjectWhileNothingChanged = () => {
    const next = editor && !editor.isDestroyed ? select(editor) : beforeTheEngineMounts;
    if (!isEqual(next, lastSelected.current)) lastSelected.current = next;
    return lastSelected.current;
  };

  return useSyncExternalStore(
    subscribe,
    selectTheSameObjectWhileNothingChanged,
    () => beforeTheEngineMounts,
  );
}
