'use client';

import { useEffect } from 'react';

import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, type UseEditorOptions } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import { LeaveEscapeToTheLayers } from './escape-to-layers';

import type { AnyExtension, Editor as TiptapEditor, Extensions } from '@tiptap/core';

export { EditorContent };

const placeholderOfTheTextbox = ({ editor }: { editor: TiptapEditor }) =>
  editor.view.dom.getAttribute('aria-placeholder') ?? '';

export function extensionsFor({
  maxLength,
  markdown,
}: {
  maxLength: number | undefined;
  markdown: AnyExtension | undefined;
}): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      gapcursor: false,
      trailingNode: false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    Placeholder.configure({ placeholder: placeholderOfTheTextbox }),
    CharacterCount.configure({ limit: maxLength }),
    LeaveEscapeToTheLayers,
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
