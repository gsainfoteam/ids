import { BlockEditorBoldPart, type BlockEditorBoldPartProps } from './parts/bold';
import {
  BlockEditorBubbleMenuPart,
  type BlockEditorBubbleMenuPartProps,
} from './parts/bubble-menu';
import { BlockEditorCodePart } from './parts/code';
import { BlockEditorColorPart, type BlockEditorColorPartProps } from './parts/color';
import { BlockEditorContentPart, type BlockEditorContentPartProps } from './parts/content';
import { BlockEditorCountPart, type BlockEditorCountPartProps } from './parts/count';
import { BlockEditorHighlightPart } from './parts/highlight';
import { BlockEditorItalicPart } from './parts/italic';
import { BlockEditorLinkPart, type BlockEditorLinkPartProps } from './parts/link';
import { BlockEditorSeparatorPart, type BlockEditorSeparatorPartProps } from './parts/separator';
import { BlockEditorStrikePart } from './parts/strike';
import { BlockEditorSubscriptPart } from './parts/subscript';
import {
  BlockEditorSuperscriptPart,
} from './parts/superscript';
import { BlockEditorTextAlignPart, type BlockEditorTextAlignPartProps } from './parts/text-align';
import { BlockEditorUnderlinePart } from './parts/underline';
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
import type { EditorCountState } from '../editor/parts/count';
import type { EditorTextAlignment } from '../editor/parts/text-align';
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

  export type ContentProps = BlockEditorContentPartProps;
  export type CountProps = BlockEditorCountPartProps;
  export type BubbleMenuProps = BlockEditorBubbleMenuPartProps;
  export type SeparatorProps = BlockEditorSeparatorPartProps;
  export type ToolProps = BlockEditorBoldPartProps;
  export type ColorProps = BlockEditorColorPartProps;
  export type LinkProps = BlockEditorLinkPartProps;
  export type TextAlignProps = BlockEditorTextAlignPartProps;

  export const Content = BlockEditorContentPart;
  export const Count = BlockEditorCountPart;
  export const BubbleMenu = BlockEditorBubbleMenuPart;
  export const Separator = BlockEditorSeparatorPart;
  export const Bold = BlockEditorBoldPart;
  export const Italic = BlockEditorItalicPart;
  export const Underline = BlockEditorUnderlinePart;
  export const Strike = BlockEditorStrikePart;
  export const Code = BlockEditorCodePart;
  export const Highlight = BlockEditorHighlightPart;
  export const Subscript = BlockEditorSubscriptPart;
  export const Superscript = BlockEditorSuperscriptPart;
  export const Color = BlockEditorColorPart;
  export const Link = BlockEditorLinkPart;
  export const TextAlign = BlockEditorTextAlignPart;

  export const Style = editorStyle;
}

export type { BlockEditorProps };
