'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { EditorBar } from './bar';
import { useInternalEditorContext } from '../context';
import { EditorLink } from './link';
import { EditorBold, EditorCode, EditorItalic, EditorStrike } from './marks';
import { useInternalTranslate } from '../../../../internal/translate';
import { Popover } from '../../../overlay/popover';
import { useInternalEditorSelector } from '../hooks/use-editor-selector';
import { editorMessages } from '../messages-catalog';

import type { Editor as TiptapEditor } from '@tiptap/core';

export type EditorBubbleMenuProps = {
  'aria-label'?: string;
  className?: string;
  children?: ReactNode;
};

type TextSelection = { from: number; to: number; focused: boolean };

const DEFAULT_TOOLS = (
  <>
    <EditorBold />
    <EditorItalic />
    <EditorStrike />
    <EditorCode />
    <EditorLink />
  </>
);

function selectedText(editor: TiptapEditor): TextSelection | null {
  const { selection } = editor.state;
  const textOnly = 'node' in selection === false;
  if (selection.empty || !textOnly) return null;
  return { from: selection.from, to: selection.to, focused: editor.isFocused };
}

function rectAround(editor: TiptapEditor, { from, to }: TextSelection, box: DOMRect) {
  const start = editor.view.coordsAtPos(from);
  const end = editor.view.coordsAtPos(to, -1);
  const oneLine = Math.abs(start.top - end.top) < 1;
  const left = oneLine ? Math.min(start.left, end.left) : box.left;
  const right = oneLine ? Math.max(start.right, end.right) : box.right;
  return {
    top: start.top - box.top,
    left: left - box.left,
    width: Math.max(right - left, 1),
    height: Math.max(end.bottom - start.top, 1),
  } satisfies CSSProperties;
}

function useInternalPointerSelecting(editor: TiptapEditor | null) {
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

export function EditorBubbleMenu({
  'aria-label': ariaLabel,
  className,
  children,
}: EditorBubbleMenuProps) {
  const t = useInternalTranslate(editorMessages);
  const { editor, editable, styles } = useInternalEditorContext('Editor.BubbleMenu');
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [anchorBox, setAnchorBox] = useState<CSSProperties>({});
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);
  const [focusedInside, setFocusedInside] = useState(false);
  const selecting = useInternalPointerSelecting(editor);
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
          if (!next) setDismissedAt(selectionKey);
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
