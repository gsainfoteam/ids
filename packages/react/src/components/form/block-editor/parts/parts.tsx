'use client';

import { type ComponentType } from 'react';

import { registerEditorPartAlias } from '../../editor/lib/part-alias';
import { EditorBubbleMenu, type EditorBubbleMenuProps } from '../../editor/parts/bubble-menu';
import { EditorColor, type EditorColorProps } from '../../editor/parts/color';
import { EditorContentPart, type EditorContentProps } from '../../editor/parts/content';
import { EditorCount, type EditorCountProps } from '../../editor/parts/count';
import { EditorLink, type EditorLinkProps } from '../../editor/parts/link';
import {
  EditorBold,
  EditorCode,
  EditorHighlight,
  EditorItalic,
  EditorStrike,
  EditorSubscript,
  EditorSuperscript,
  EditorUnderline,
  type EditorMarkProps,
} from '../../editor/parts/marks';
import { EditorSeparator, type EditorSeparatorProps } from '../../editor/parts/separator';
import { EditorTextAlign, type EditorTextAlignProps } from '../../editor/parts/text-align';

function renamedPart<P extends object>(Part: ComponentType<P>, displayName: string) {
  function Renamed(props: P) {
    return <Part {...props} />;
  }
  Renamed.displayName = displayName;
  registerEditorPartAlias(Renamed, Part);

  return Renamed;
}

export const BlockEditorContent = renamedPart<EditorContentProps>(
  EditorContentPart,
  'BlockEditor.Content',
);
export const BlockEditorCount = renamedPart<EditorCountProps>(EditorCount, 'BlockEditor.Count');
export const BlockEditorSeparator = renamedPart<EditorSeparatorProps>(
  EditorSeparator,
  'BlockEditor.Separator',
);
export const BlockEditorBold = renamedPart<EditorMarkProps>(EditorBold, 'BlockEditor.Bold');
export const BlockEditorItalic = renamedPart<EditorMarkProps>(EditorItalic, 'BlockEditor.Italic');
export const BlockEditorUnderline = renamedPart<EditorMarkProps>(
  EditorUnderline,
  'BlockEditor.Underline',
);
export const BlockEditorStrike = renamedPart<EditorMarkProps>(EditorStrike, 'BlockEditor.Strike');
export const BlockEditorCode = renamedPart<EditorMarkProps>(EditorCode, 'BlockEditor.Code');
export const BlockEditorHighlight = renamedPart<EditorMarkProps>(
  EditorHighlight,
  'BlockEditor.Highlight',
);
export const BlockEditorSubscript = renamedPart<EditorMarkProps>(
  EditorSubscript,
  'BlockEditor.Subscript',
);
export const BlockEditorSuperscript = renamedPart<EditorMarkProps>(
  EditorSuperscript,
  'BlockEditor.Superscript',
);
export const BlockEditorColor = renamedPart<EditorColorProps>(EditorColor, 'BlockEditor.Color');
export const BlockEditorLink = renamedPart<EditorLinkProps>(EditorLink, 'BlockEditor.Link');
export const BlockEditorTextAlign = renamedPart<EditorTextAlignProps>(
  EditorTextAlign,
  'BlockEditor.TextAlign',
);

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

export function BlockEditorBubbleMenu({ children, ...props }: EditorBubbleMenuProps) {
  return <EditorBubbleMenu {...props}>{children ?? BUBBLE_TOOLS}</EditorBubbleMenu>;
}

BlockEditorBubbleMenu.displayName = 'BlockEditor.BubbleMenu';
registerEditorPartAlias(BlockEditorBubbleMenu, EditorBubbleMenu);
