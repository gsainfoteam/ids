import {
  BlockEditorBold,
  BlockEditorBubbleMenu,
  BlockEditorCode,
  BlockEditorColor,
  BlockEditorContent,
  BlockEditorCount,
  BlockEditorHighlight,
  BlockEditorItalic,
  BlockEditorLink,
  BlockEditorSeparator,
  BlockEditorStrike,
  BlockEditorSubscript,
  BlockEditorSuperscript,
  BlockEditorTextAlign,
  BlockEditorUnderline,
} from './parts/parts';
import {
  BlockEditorRoot,
  type BlockEditorProps,
  type BlockEditorState,
  type BlockEditorVariant,
} from './root';
import { editorStyle } from '../editor/style';

import type {
  EditorImageUploadOptions,
  EditorInstance,
  EditorMentionOptions,
  UseEditorOptions,
} from '../editor/hooks/use-editor';
import type { EditorFormat } from '../editor/lib/value';
import type { FindMentions as EditorFindMentions, EditorMention } from '../editor/mention/node';
import type { EditorBubbleMenuProps } from '../editor/parts/bubble-menu';
import type { EditorColorProps } from '../editor/parts/color';
import type { EditorContentProps } from '../editor/parts/content';
import type { EditorCountProps, EditorCountState } from '../editor/parts/count';
import type { EditorLinkProps } from '../editor/parts/link';
import type { EditorMarkProps } from '../editor/parts/marks';
import type { EditorSeparatorProps } from '../editor/parts/separator';
import type { EditorTextAlignment, EditorTextAlignProps } from '../editor/parts/text-align';
import type { JSONContent } from '@tiptap/core';

export function BlockEditor(props: BlockEditor.Props) {
  return <BlockEditorRoot {...props} />;
}

export namespace BlockEditor {
  export type Props = BlockEditorProps;
  export type State = BlockEditorState;
  export type Variant = BlockEditorVariant;
  export type Format = EditorFormat;
  export type Json = JSONContent;
  export type CountState = EditorCountState;
  export type TextAlignment = EditorTextAlignment;
  export type Mention = EditorMention;
  export type FindMentions = EditorFindMentions;
  export type Instance = EditorInstance;
  export type Options = UseEditorOptions;
  export type ImageUploadOptions = EditorImageUploadOptions;
  export type MentionOptions = EditorMentionOptions;

  export type ContentProps = EditorContentProps;
  export type CountProps = EditorCountProps;
  export type BubbleMenuProps = EditorBubbleMenuProps;
  export type SeparatorProps = EditorSeparatorProps;
  export type ToolProps = EditorMarkProps;
  export type ColorProps = EditorColorProps;
  export type LinkProps = EditorLinkProps;
  export type TextAlignProps = EditorTextAlignProps;

  export const Content = BlockEditorContent;
  export const Count = BlockEditorCount;
  export const BubbleMenu = BlockEditorBubbleMenu;
  export const Separator = BlockEditorSeparator;
  export const Bold = BlockEditorBold;
  export const Italic = BlockEditorItalic;
  export const Underline = BlockEditorUnderline;
  export const Strike = BlockEditorStrike;
  export const Code = BlockEditorCode;
  export const Highlight = BlockEditorHighlight;
  export const Subscript = BlockEditorSubscript;
  export const Superscript = BlockEditorSuperscript;
  export const Color = BlockEditorColor;
  export const Link = BlockEditorLink;
  export const TextAlign = BlockEditorTextAlign;

  export const Style = editorStyle;
}

export type { BlockEditorProps };
