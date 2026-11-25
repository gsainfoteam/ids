'use client';

import type { ReactNode } from 'react';

import { EditorBar } from './bar';
import { useInternalEditorContext } from '../context';
import { EditorLink } from './link';
import { EditorBold, EditorCode, EditorItalic, EditorStrike } from './marks';
import { useInternalTranslate } from '../../../../internal/translate';
import { Popover } from '../../../overlay/popover';
import { useInternalEditorBubbleMenu } from '../hooks/use-editor-bubble-menu';
import { editorMessages } from '../messages-catalog';

export type EditorBubbleMenuProps = {
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
};

const DEFAULT_TOOLS = (
  <>
    <EditorBold />
    <EditorItalic />
    <EditorStrike />
    <EditorCode />
    <EditorLink />
  </>
);

export function EditorBubbleMenu({
  'aria-label': ariaLabel,
  className,
  children,
}: EditorBubbleMenuProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, styles } = useInternalEditorContext('Editor.BubbleMenu');
  const { anchorRef, anchorBox, open, dismiss, setFocusedInside } = useInternalEditorBubbleMenu(
    editor,
    editable,
  );

  if (!editor) return null;

  return (
    <>
      <span
        ref={anchorRef}
        aria-hidden="true"
        data-editor-bubble-anchor=""
        className={styles.bubbleAnchor()}
        style={anchorBox}
      />
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (!next) dismiss();
        }}
      >
        <Popover.Content
          anchor={anchorRef}
          side="top"
          sideOffset={6}
          aria-label={ariaLabel ?? t('editor.bubbleMenu')}
          className={styles.bubble({ className })}
          onFocus={() => setFocusedInside(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null))
              setFocusedInside(false);
          }}
        >
          <EditorBar
            toolbar
            label={ariaLabel ?? t('editor.bubbleMenu')}
            className={styles.bubbleBar()}
          >
            {children ?? DEFAULT_TOOLS}
          </EditorBar>
        </Popover.Content>
      </Popover>
    </>
  );
}

EditorBubbleMenu.displayName = 'Editor.BubbleMenu';
