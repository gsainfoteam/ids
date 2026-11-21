'use client';

import {
  BoldIcon,
  CodeBracketIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from '@heroicons/react/16/solid';

import { EditorToggleTool, type EditorToggleSpec, type EditorToolProps } from './tool';

export type EditorMarkProps = EditorToolProps;

function markSpec(
  name: string,
  mark: 'bold' | 'italic' | 'underline' | 'strike' | 'code',
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
  };
}

const BOLD = markSpec('Bold', 'bold', 'editor.bold', <BoldIcon />);
const ITALIC = markSpec('Italic', 'italic', 'editor.italic', <ItalicIcon />);
const UNDERLINE = markSpec('Underline', 'underline', 'editor.underline', <UnderlineIcon />);
const STRIKE = markSpec('Strike', 'strike', 'editor.strike', <StrikethroughIcon />);
const CODE = markSpec('Code', 'code', 'editor.code', <CodeBracketIcon />);

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
