'use client';

import { registerEditorPartAlias } from '../../editor/lib/part-alias';
import { EditorBubbleMenu, type EditorBubbleMenuProps } from '../../editor/parts/bubble-menu';
import { EditorColor } from '../../editor/parts/color';
import { EditorLink } from '../../editor/parts/link';
import {
  EditorBold,
  EditorCode,
  EditorItalic,
  EditorStrike,
  EditorUnderline,
} from '../../editor/parts/marks';

export type BlockEditorBubbleMenuPartProps = EditorBubbleMenuProps;

const BUBBLE_TOOLS = (
  <>
    <EditorBold />
    <EditorItalic />
    <EditorUnderline />
    <EditorStrike />
    <EditorCode />
    <EditorColor />
    <EditorLink />
  </>
);

export function BlockEditorBubbleMenuPart({ children, ...props }: BlockEditorBubbleMenuPartProps) {
  return <EditorBubbleMenu {...props}>{children ?? BUBBLE_TOOLS}</EditorBubbleMenu>;
}

BlockEditorBubbleMenuPart.displayName = 'BlockEditor.BubbleMenu';
registerEditorPartAlias(BlockEditorBubbleMenuPart, EditorBubbleMenu);
