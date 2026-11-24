'use client';

import { type MouseEvent } from 'react';

import { ScrollArea } from '../../../layout/scroll-area';
import { useInternalEditorContext } from '../context';

export type EditorContentProps = {
  placeholder?: string;
  className?: string;
};

function asReactProps({
  class: className,
  spellcheck: spellCheck,
  ...attributes
}: Record<string, string>) {
  return { ...attributes, className, spellCheck: spellCheck === 'true' };
}

export function EditorContentPart(_: EditorContentProps) {
  const { editor, styles, contentAttributes, floating, EngineContent } =
    useInternalEditorContext('Editor.Content');

  const focusTheEndFromTheSpaceBelow = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !editor?.isEditable) return;
    event.preventDefault();
    editor.commands.focus('end');
  };

  return (
    <ScrollArea className={styles.scrollArea()}>
      <ScrollArea.Viewport>
        <div
          data-editor-document=""
          className={styles.document()}
          onMouseDown={focusTheEndFromTheSpaceBelow}
        >
          {editor && EngineContent ? (
            <EngineContent editor={editor} />
          ) : (
            <div {...asReactProps(contentAttributes)} />
          )}
          {floating}
        </div>
      </ScrollArea.Viewport>
    </ScrollArea>
  );
}

EditorContentPart.displayName = 'Editor.Content';
