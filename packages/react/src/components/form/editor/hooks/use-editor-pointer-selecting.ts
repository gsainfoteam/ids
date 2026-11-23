'use client';

import { useEffect, useState } from 'react';

import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorPointerSelecting(editor: TiptapEditor | null) {
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const view = dom.ownerDocument.defaultView ?? window;
    const start = () => setSelecting(true);
    const end = () => setSelecting(false);
    dom.addEventListener('pointerdown', start);
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', end);
    return () => {
      dom.removeEventListener('pointerdown', start);
      view.removeEventListener('pointerup', end);
      view.removeEventListener('pointercancel', end);
    };
  }, [editor]);

  return selecting;
}
