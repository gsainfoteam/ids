import { type CSSProperties, type ReactNode } from 'react';

import { EditorCallout, type EditorCalloutProps } from './callout/tool';
import { EditorDetails, type EditorDetailsProps } from './details/tool';
import { EditorImage, type EditorImageProps } from './image/tool';
import { type EditorFormat } from './lib/value';
import { EditorBlockType, type EditorBlockTypeProps, type EditorHeadingLevel } from './parts/block-type';
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
import { EditorTextAlign, type EditorTextAlignment, type EditorTextAlignProps } from './parts/text-align';
import { EditorRoot, type EditorState, type EditorType, type EditorVariant } from './root';
import { editorStyle } from './style';
import { EditorTable, type EditorTableProps } from './table/tool';

import type { EditorMention, FindMentions } from './mention/node';
import type { IdsSize } from '../../../tokens/types';
import type { JSONContent } from '@tiptap/core';

export function Editor(props: Editor.Props) {
  return <EditorRoot {...props} />;
}

export namespace Editor {
  type StringValue = {
    format?: 'html' | 'markdown';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  };

  type JsonValue = {
    format: 'json';
    value?: JSONContent;
    defaultValue?: JSONContent;
    onValueChange?: (value: JSONContent) => void;
  };

  export type Props = (StringValue | JsonValue) & {
    name?: string;
    form?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    maxLength?: number;
    onImageUpload?: (file: File) => Promise<string>;
    mentions?: FindMentions;
    type?: EditorType;
    spellCheck?: boolean;
    variant?: EditorVariant;
    size?: IdsSize;
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
    'aria-required'?: boolean | 'true' | 'false';
    className?: string | ((state: EditorState) => string | undefined);
    style?: CSSProperties | ((state: EditorState) => CSSProperties | undefined);
    children?: ReactNode;
  };
  export type State = EditorState;
  export type Variant = EditorVariant;
  export type Type = EditorType;
  export type Format = EditorFormat;
  export type Json = JSONContent;
  export type HeadingLevel = EditorHeadingLevel;
  export type CountState = EditorCountState;
  export type TextAlignment = EditorTextAlignment;
  export type Mention = EditorMention;

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

export type EditorProps = Editor.Props;
