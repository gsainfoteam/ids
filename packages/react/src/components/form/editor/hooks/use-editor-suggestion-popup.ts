'use client';

import { useEffect, useId, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import { useInternalEditorSuggestionAnchorBox } from './use-editor-suggestion-anchor-box';

import type { SuggestionStore } from '../suggestion/store';
import type { Editor as TiptapEditor } from '@tiptap/core';

export function useInternalEditorSuggestionPopup<Item>(
  store: SuggestionStore<Item>,
  editor: TiptapEditor | null,
) {
  const view = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;
  const activeId = view.open && view.items.length > 0 ? optionId(view.highlighted) : undefined;
  const [anchorRef, anchorBox] = useInternalEditorSuggestionAnchorBox(view.anchor, view.open);
  const listRef = useRef<HTMLDivElement>(null);

  const dom = editor?.view.dom;
  useEffect(() => {
    if (!dom || !activeId) return;
    dom.setAttribute('aria-controls', listId);
    dom.setAttribute('aria-activedescendant', activeId);
    return () => {
      dom.removeAttribute('aria-controls');
      dom.removeAttribute('aria-activedescendant');
    };
  }, [dom, listId, activeId]);

  useLayoutEffect(() => {
    if (activeId)
      listRef.current?.ownerDocument.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  return { view, listId, optionId, anchorRef, anchorBox, listRef };
}
