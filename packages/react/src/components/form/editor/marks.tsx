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
  shortcut: EditorToggleSpec['shortcut'],
): EditorToggleSpec {
  return {
    name,
    label,
    icon,
    shortcut,
    isActive: (editor) => editor.isActive(mark),
    can: (editor) => editor.can().toggleMark(mark),
    run: (editor) => editor.chain().toggleMark(mark).run(),
    extension: isLazyMark(mark) ? mark : undefined,
  };
}

const BOLD = markSpec('Bold', 'bold', 'editor.bold', <BoldIcon />, 'Mod+B');
const ITALIC = markSpec('Italic', 'italic', 'editor.italic', <ItalicIcon />, 'Mod+I');
const UNDERLINE = markSpec(
  'Underline',
  'underline',
  'editor.underline',
  <UnderlineIcon />,
  'Mod+U',
);
const STRIKE = markSpec('Strike', 'strike', 'editor.strike', <StrikethroughIcon />, 'Mod+Shift+S');
const CODE = markSpec('Code', 'code', 'editor.code', <CodeBracketIcon />, 'Mod+E');
const HIGHLIGHT = markSpec(
  'Highlight',
  'highlight',
  'editor.highlight',
  <Highlighter />,
  'Mod+Shift+H',
);
const SUBSCRIPT = markSpec('Subscript', 'subscript', 'editor.subscript', <Subscript />, 'Mod+,');
const SUPERSCRIPT = markSpec(
  'Superscript',
  'superscript',
  'editor.superscript',
  <Superscript />,
  'Mod+.',
);

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
