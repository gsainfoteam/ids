'use client';

import type { ReactNode } from 'react';

import { listStyles } from '../../../../internal/lib/list-styles';
import { cn } from '../../../../utils';
import { ScrollArea } from '../../../layout/scroll-area';
import { Popover } from '../../../overlay/popover';
import { useInternalEditorContext } from '../context';
import { useInternalEditorSuggestionPopup } from '../hooks/use-editor-suggestion-popup';

import type { SuggestionStore } from './store';

export type EditorSuggestionPopupProps<Item> = {
  store: SuggestionStore<Item>;
  label: string;
  keyOf: (item: Item) => string;
  status: (view: { loading: boolean; query: string }) => string;
  children: (item: Item) => ReactNode;
};

const keepTheCaretInTheEditor = (event: { preventDefault: () => void }) => event.preventDefault();

export function EditorSuggestionPopup<Item>({
  store,
  label,
  keyOf,
  status,
  children,
}: EditorSuggestionPopupProps<Item>) {
  const { editor, styles } = useInternalEditorContext('Editor');
  const { view, listId, optionId, anchorRef, anchorBox, listRef } =
    useInternalEditorSuggestionPopup(store, editor);
  const message = view.loading || view.items.length === 0 ? status(view) : '';

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
