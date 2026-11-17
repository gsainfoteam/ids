'use client';

import { useEditorState } from '@tiptap/react';
import { isEqual } from 'es-toolkit';

import type { Editor as TiptapEditor } from '@tiptap/core';

export function useEditorSelector<T>(
  editor: TiptapEditor | null,
  select: (editor: TiptapEditor) => T,
  beforeTheEngineMounts: T,
): T {
  const selectFromTheMountedEditorNotTheSnapshot = () =>
    editor && !editor.isDestroyed ? select(editor) : beforeTheEngineMounts;

  return (
    useEditorState({
      editor,
      selector: selectFromTheMountedEditorNotTheSnapshot,
      equalityFn: isEqual,
    }) ?? beforeTheEngineMounts
  );
}
