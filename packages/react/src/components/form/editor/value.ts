import { keepAllowedImages } from '../../typography/rich-text/schema/url-rules';

import type { Editor as TiptapEditor, JSONContent } from '@tiptap/core';

export type EditorFormat = 'html' | 'markdown' | 'json';

export type EditorValue = string | JSONContent;

export function readValue(editor: TiptapEditor, format: EditorFormat): EditorValue {
  if (format === 'json') return editor.getJSON();
  if (editor.isEmpty) return '';
  return format === 'markdown' ? editor.getMarkdown() : editor.getHTML();
}

export function writable(value: EditorValue, format: EditorFormat, uploaded: ReadonlySet<string>) {
  return format === 'json' && typeof value !== 'string'
    ? keepAllowedImages(value, uploaded)
    : value;
}

export function writeValue(
  editor: TiptapEditor,
  value: EditorValue | undefined,
  format: EditorFormat,
  uploaded: ReadonlySet<string>,
) {
  editor.commands.setContent(writable(value ?? '', format, uploaded), {
    emitUpdate: false,
    contentType: format,
  });
}

export function formText(value: EditorValue | undefined, empty: boolean) {
  if (value === undefined || empty) return '';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function isEmptyValue(value: EditorValue | undefined) {
  if (value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return !value.content?.some((node) => node.content?.length || node.type !== 'paragraph');
}
