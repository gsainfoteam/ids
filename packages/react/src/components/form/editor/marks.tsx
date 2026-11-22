'use client';

import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@heroicons/react/16/solid';
import { Highlighter, Subscript, Superscript } from 'lucide-react';

import { EditorToggleTool, type EditorToggleSpec, type EditorToolProps } from './tool';

export type EditorMarkProps = EditorToolProps;

type LazyMark = 'highlight' | 'subscript' | 'superscript';

const LAZY_MARKS = new Set<string>(['highlight', 'subscript', 'superscript']);

const isLazyMark = (mark: string): mark is LazyMark => LAZY_MARKS.has(mark);

function markSpec(
  name: string,
  mark: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | LazyMark,
  label: EditorToggleSpec['label'],
  icon: EditorToggleSpec['icon'],
): EditorToggleSpec {
  return {
    name,
    label,
    icon,
    isActive: (editor) => editor.isActive(mark),
    can: (editor) => editor.can().toggleMark(mark),
    run: (editor) => editor.chain().toggleMark(mark).run(),
    extension: isLazyMark(mark) ? mark : undefined,
  };
}

const BOLD = markSpec('Bold', 'bold', 'editor.bold', <BoldIcon />);
const ITALIC = markSpec('Italic', 'italic', 'editor.italic', <ItalicIcon />);
const UNDERLINE = markSpec('Underline', 'underline', 'editor.underline', <UnderlineIcon />);
const STRIKE = markSpec('Strike', 'strike', 'editor.strike', <StrikethroughIcon />);
const CODE = markSpec('Code', 'code', 'editor.code', <CodeBracketIcon />);
const HIGHLIGHT = markSpec('Highlight', 'highlight', 'editor.highlight', <Highlighter />);
const SUBSCRIPT = markSpec('Subscript', 'subscript', 'editor.subscript', <Subscript />);
const SUPERSCRIPT = markSpec('Superscript', 'superscript', 'editor.superscript', <Superscript />);

export function EditorBold(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={BOLD} />;
}

EditorBold.displayName = 'Editor.Bold';

export function EditorItalic(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={ITALIC} />;
}

EditorItalic.displayName = 'Editor.Italic';

export function EditorUnderline(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={UNDERLINE} />;
}

EditorUnderline.displayName = 'Editor.Underline';

export function EditorStrike(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={STRIKE} />;
}

EditorStrike.displayName = 'Editor.Strike';

export function EditorCode(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={CODE} />;
}

EditorCode.displayName = 'Editor.Code';

export function EditorHighlight(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={HIGHLIGHT} />;
}

EditorHighlight.displayName = 'Editor.Highlight';

export function EditorSubscript(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={SUBSCRIPT} />;
}

EditorSubscript.displayName = 'Editor.Subscript';

export function EditorSuperscript(props: EditorMarkProps) {
  return <EditorToggleTool {...props} spec={SUPERSCRIPT} />;
}

EditorSuperscript.displayName = 'Editor.Superscript';
