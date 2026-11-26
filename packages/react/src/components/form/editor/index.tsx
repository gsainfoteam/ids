import { EditorCallout, type EditorCalloutProps } from './callout/tool';
import { EditorDetails, type EditorDetailsProps } from './details/tool';
import {
  type EditorImageUploadOptions,
  type EditorInstance,
  type EditorMentionOptions,
  type UseEditorOptions,
} from './hooks/use-editor';
import { EditorImage, type EditorImageProps } from './image/tool';
import { type EditorFormat } from './lib/value';
import {
  EditorBlockType,
  type EditorBlockTypeProps,
  type EditorHeadingLevel,
} from './parts/block-type';
import {
  EditorBlockquote,
  EditorBulletList,
  EditorCodeBlock,
  EditorOrderedList,
  EditorTaskList,
} from './parts/blocks';
import { EditorBubbleMenu, type EditorBubbleMenuProps } from './parts/bubble-menu';
import { EditorColor, type EditorColorProps } from './parts/color';
import { EditorContentPart, type EditorContentProps } from './parts/content';
import { EditorCount, type EditorCountProps, type EditorCountState } from './parts/count';
import { EditorHorizontalRule, type EditorHorizontalRuleProps } from './parts/horizontal-rule';
import { EditorLink, type EditorLinkProps } from './parts/link';
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
} from './parts/marks';
import { EditorSeparator, type EditorSeparatorProps } from './parts/separator';
import {
  EditorTextAlign,
  type EditorTextAlignment,
  type EditorTextAlignProps,
} from './parts/text-align';
import { EditorRoot, type EditorProps, type EditorState, type EditorVariant } from './root';
import { editorStyle } from './style';
import { EditorTable, type EditorTableProps } from './table/tool';

import type { FindMentions as EditorFindMentions, EditorMention } from './mention/node';
import type { JSONContent } from '@tiptap/core';

export function Editor(props: Editor.Props) {
  return <EditorRoot {...props} />;
}

export namespace Editor {
  export type Props = EditorProps;
  export type State = EditorState;
  export type Variant = EditorVariant;
  export type Format = EditorFormat;
  export type Json = JSONContent;
  export type HeadingLevel = EditorHeadingLevel;
  export type CountState = EditorCountState;
  export type TextAlignment = EditorTextAlignment;
  export type Mention = EditorMention;
  export type FindMentions = EditorFindMentions;
  export type Instance = EditorInstance;
  export type Options = UseEditorOptions;
  export type ImageUploadOptions = EditorImageUploadOptions;
  export type MentionOptions = EditorMentionOptions;

  export type ContentProps = EditorContentProps;
  export type ToolProps = EditorMarkProps;
  export type BlockTypeProps = EditorBlockTypeProps;
  export type LinkProps = EditorLinkProps;
  export type ColorProps = EditorColorProps;
  export type ImageProps = EditorImageProps;
  export type HorizontalRuleProps = EditorHorizontalRuleProps;
  export type TableProps = EditorTableProps;
  export type TextAlignProps = EditorTextAlignProps;
  export type CalloutProps = EditorCalloutProps;
  export type DetailsProps = EditorDetailsProps;
  export type SeparatorProps = EditorSeparatorProps;
  export type BubbleMenuProps = EditorBubbleMenuProps;
  export type CountProps = EditorCountProps;

  export const Content = EditorContentPart;
  export const BlockType = EditorBlockType;
  export const Bold = EditorBold;
  export const Italic = EditorItalic;
  export const Underline = EditorUnderline;
  export const Strike = EditorStrike;
  export const Code = EditorCode;
  export const Highlight = EditorHighlight;
  export const Subscript = EditorSubscript;
  export const Superscript = EditorSuperscript;
  export const Color = EditorColor;
  export const Link = EditorLink;
  export const Image = EditorImage;
  export const BulletList = EditorBulletList;
  export const OrderedList = EditorOrderedList;
  export const TaskList = EditorTaskList;
  export const Blockquote = EditorBlockquote;
  export const CodeBlock = EditorCodeBlock;
  export const HorizontalRule = EditorHorizontalRule;
  export const Table = EditorTable;
  export const TextAlign = EditorTextAlign;
  export const Callout = EditorCallout;
  export const Details = EditorDetails;
  export const Separator = EditorSeparator;
  export const BubbleMenu = EditorBubbleMenu;
  export const Count = EditorCount;

  export const Style = editorStyle;
}

export { useEditor } from './hooks/use-editor';
export type { EditorProps };
