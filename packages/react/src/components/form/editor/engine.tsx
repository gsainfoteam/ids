'use client';

import { useEffect } from 'react';

import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, type UseEditorOptions } from '@tiptap/react';

import { EditorCodeBlockNode } from './code-block/node';
import { LeaveEscapeToTheLayers } from './escape-to-layers';
import { EditorImageNode } from './image/node';
import { documentStarterKit } from '../../typography/rich-text/schema/starter-kit';

import type { FeatureExtensions } from './load-engine';
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
  features,
  images,
  taskLabel,
}: {
  maxLength: number | undefined;
  markdown: AnyExtension | undefined;
  features: FeatureExtensions;
  images: ImageSetup;
  taskLabel: (text: string) => string;
}): Extensions {
  return [
    documentStarterKit([1, 2, 3, 4], { codeBlock: false }),
    EditorCodeBlockNode,
    Placeholder.configure({ placeholder: placeholderOfTheTextbox }),
    CharacterCount.configure({ limit: maxLength }),
    LeaveEscapeToTheLayers,
    EditorImageNode.configure({ uploaded: images.uploaded, insertable: !!features.imageUpload }),
    ...(features.imageUpload ? features.imageUpload.imageUploadExtensions(images.start) : []),
    ...(features.highlight ? [features.highlight] : []),
    ...(features.taskList ? features.taskList(taskLabel) : []),
    ...(features.textAlign
      ? [features.textAlign.configure({ types: ['heading', 'paragraph'] })]
      : []),
    ...(features.table
      ? [
          features.table.Table.configure({ resizable: false }),
          features.table.TableRow,
          features.table.TableHeader,
          features.table.TableCell,
        ]
      : []),
    ...(features.callout ? [features.callout] : []),
    ...(features.details ?? []),
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
