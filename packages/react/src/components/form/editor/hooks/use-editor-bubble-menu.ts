'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import { useInternalEditorPointerSelecting } from './use-editor-pointer-selecting';
import { useInternalEditorSelector } from './use-editor-selector';
import { rectAround, selectedText } from '../lib/text-selection';

import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorBubbleMenu(editor: TiptapEditor | null, editable: boolean) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [anchorBox, setAnchorBox] = useState<CSSProperties>({});
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);
  const [focusedInside, setFocusedInside] = useState(false);
  const selecting = useInternalEditorPointerSelecting(editor);
  const selection = useInternalEditorSelector(editor, selectedText, null);

  const selectionKey = selection ? `${selection.from}:${selection.to}` : null;
  const open =
    editable &&
    selection != null &&
    (selection.focused || focusedInside) &&
    !selecting &&
    dismissedAt !== selectionKey;

  useLayoutEffect(() => {
    const document = anchorRef.current?.parentElement;
    if (!open || !editor || !selection || !document) return;
    setAnchorBox(rectAround(editor, selection, document.getBoundingClientRect()));
  }, [open, editor, selection]);

  const dismiss = () => setDismissedAt(selectionKey);

  return { anchorRef, anchorBox, open, dismiss, setFocusedInside };
}
