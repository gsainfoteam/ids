'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { listStyles } from '../../../../internal/list-styles';
import { cn } from '../../../../utils';
import { ScrollArea } from '../../../layout/scroll-area';
import { Popover } from '../../../overlay/popover';
import { useEditorContext } from '../context';

import type { SuggestionStore } from './store';

export type EditorSuggestionPopupProps<Item> = {
  store: SuggestionStore<Item>;
  label: string;
  keyOf: (item: Item) => string;
  status: (view: { loading: boolean; query: string }) => string;
  children: (item: Item) => ReactNode;
};

const keepTheCaretInTheEditor = (event: { preventDefault: () => void }) => event.preventDefault();

function useAnchorBox(anchor: (() => DOMRect | null) | null, open: boolean) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const document = anchorRef.current?.parentElement;
    const rect = anchor?.();
    if (!open || !rect || !document) return;
    const origin = document.getBoundingClientRect();
    setBox({
      top: rect.top - origin.top,
      left: rect.left - origin.left,
      width: Math.max(rect.width, 1),
      height: Math.max(rect.height, 1),
    });
  }, [anchor, open]);

  return [anchorRef, box] as const;
}

function useActiveDescendant(dom: HTMLElement | undefined, listId: string, activeId?: string) {
  useEffect(() => {
    if (!dom || !activeId) return;
    dom.setAttribute('aria-controls', listId);
    dom.setAttribute('aria-activedescendant', activeId);
    return () => {
      dom.removeAttribute('aria-controls');
      dom.removeAttribute('aria-activedescendant');
    };
  }, [dom, listId, activeId]);
}

export function EditorSuggestionPopup<Item>({
  store,
  label,
  keyOf,
  status,
  children,
}: EditorSuggestionPopupProps<Item>) {
  const { editor, styles } = useEditorContext('Editor');
  const view = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const listId = useId();
  const optionId = (index: number) => `${listId}-${index}`;
  const activeId = view.open && view.items.length > 0 ? optionId(view.highlighted) : undefined;
  const [anchorRef, anchorBox] = useAnchorBox(view.anchor, view.open);
  const listRef = useRef<HTMLDivElement>(null);
  const message = view.loading || view.items.length === 0 ? status(view) : '';

  useActiveDescendant(editor?.view.dom, listId, activeId);

  useLayoutEffect(() => {
    if (activeId)
      listRef.current?.ownerDocument.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  if (!editor) return null;

  return (
    <>
      <span
        ref={anchorRef}
        aria-hidden="true"
        className={styles.bubbleAnchor()}
        style={anchorBox}
      />
      <Popover
        open={view.open}
        onOpenChange={(next) => {
          if (!next) store.dismiss(editor.view);
        }}
      >
        <Popover.Content
          anchor={anchorRef}
          side="bottom"
          align="start"
          sideOffset={4}
          aria-label={label}
          className={styles.suggestion()}
          onMouseDown={keepTheCaretInTheEditor}
        >
          {view.items.length > 0 && (
            <ScrollArea className={styles.suggestionScroll()}>
              <ScrollArea.Viewport asChild>
                <div
                  ref={listRef}
                  id={listId}
                  role="listbox"
                  aria-label={label}
                  className={styles.suggestionList()}
                >
                  {view.items.map((item, index) => (
                    <div
                      key={keyOf(item)}
                      id={optionId(index)}
                      role="option"
                      aria-selected={index === view.highlighted}
                      data-highlighted={index === view.highlighted ? '' : undefined}
                      className={cn(listStyles.option, styles.suggestionOption())}
                      onPointerMove={() => {
                        if (index !== view.highlighted) store.highlight(index);
                      }}
                      onClick={() => store.choose(index)}
                    >
                      {children(item)}
                    </div>
                  ))}
                </div>
              </ScrollArea.Viewport>
            </ScrollArea>
          )}
          <div role="status" className={message ? listStyles.empty : 'sr-only'}>
            {message}
          </div>
        </Popover.Content>
      </Popover>
    </>
  );
}
