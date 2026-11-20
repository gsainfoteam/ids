'use client';

import { useEffect } from 'react';

import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, type UseEditorOptions } from '@tiptap/react';

import { EditorCodeBlockNode } from './code-block/node';
import { LeaveEscapeToTheLayers } from './escape-to-layers';
import { EditorImageNode } from './image/node';
import { documentStarterKit } from '../../typography/rich-text/schema/starter-kit';

import type { PartExtensions } from './load-engine';
import type { AnyExtension, Editor as TiptapEditor, Extensions } from '@tiptap/core';

export { EditorContent };
export type ImageSetup = {
  uploaded: ReadonlySet<string>;
  start: (editor: TiptapEditor, files: File[], at: number) => void;
};

const placeholderOfTheTextbox = ({ editor }: { editor: TiptapEditor }) =>
  editor.view.dom.getAttribute('aria-placeholder') ?? '';

export function extensionsFor({
  maxLength,
  markdown,
  parts,
  images,
  taskLabel,
}: {
  maxLength: number | undefined;
  markdown: AnyExtension | undefined;
  parts: PartExtensions;
  images: ImageSetup;
  taskLabel: (text: string) => string;
}): Extensions {
  return [
    documentStarterKit([1, 2, 3, 4], { codeBlock: false }),
    EditorCodeBlockNode,
    Placeholder.configure({ placeholder: placeholderOfTheTextbox }),
    CharacterCount.configure({ limit: maxLength }),
    LeaveEscapeToTheLayers,
    EditorImageNode.configure({ uploaded: images.uploaded, insertable: !!parts.imageUpload }),
    ...(parts.imageUpload ? parts.imageUpload.imageUploadExtensions(images.start) : []),
    ...(parts.highlight ? [parts.highlight] : []),
    ...(parts.taskList ? parts.taskList(taskLabel) : []),
    ...(parts.textAlign ? [parts.textAlign.configure({ types: ['heading', 'paragraph'] })] : []),
    ...(parts.table
      ? [
          parts.table.Table.configure({ resizable: false }),
          parts.table.TableRow,
          parts.table.TableHeader,
          parts.table.TableCell,
        ]
      : []),
    ...(markdown ? [markdown] : []),
  ];
}

export function EditorEngine({
  options,
  onEditor,
}: {
  options: UseEditorOptions;
  onEditor: (editor: TiptapEditor | null) => void;
}) {
  const editor = useEditor(options, [options.extensions]);

  useEffect(() => {
    onEditor(editor);
    return () => onEditor(null);
  }, [editor, onEditor]);

  return null;
}
