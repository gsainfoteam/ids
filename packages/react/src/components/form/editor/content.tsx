'use client';

import { type MouseEvent } from 'react';

import { useEditorContext } from './context';
import { ScrollArea } from '../../layout/scroll-area';

export type EditorContentProps = {
  placeholder?: string;
  className?: string;
};

function asReactProps({ class: className, ...attributes }: Record<string, string>) {
  return { ...attributes, className };
}

export function EditorContentPart(_: EditorContentProps) {
  const { editor, styles, contentAttributes, floating, EngineContent } =
    useEditorContext('Editor.Content');

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
