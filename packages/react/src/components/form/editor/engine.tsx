'use client';

import { useEffect } from 'react';

import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor, type UseEditorOptions } from '@tiptap/react';

import { blockMatches, blocksAvailableIn, type EditorBlock } from './blocks/catalog';
import { EditorCodeBlockNode } from './code-block/node';
import { BlockHandle } from './drag-handle/extension';
import { createBlockHoverStore, type BlockHoverStore } from './drag-handle/store';
import { LeaveEscapeToTheLayers } from './escape-to-layers';
import { EditorImageNode } from './image/node';
import { CleanPastedHtml } from './paste/extension';
import { SlashMenu } from './slash/extension';
import { editorStyle } from './style';
import { slashMenuKey, mentionMenuKey } from './suggestion/keys';
import { createSuggestionStore, type SuggestionStore } from './suggestion/store';
import { documentStarterKit } from '../../typography/rich-text/schema/starter-kit';

import type { FeatureExtensions } from './load-engine';
import type { EditorMention, FindMentions } from './mention';
import type { Translate } from '../../../internal/translate';
import type { IdsSize } from '../../../tokens/types';
import type { AnyExtension, Editor as TiptapEditor, Extensions } from '@tiptap/core';

export { EditorContent };
export { EditorSlashMenu } from './slash/menu';
export { EditorBlockHandle } from './drag-handle/handle';

export type EngineSetup = {
  extensions: Extensions;
  slashMenu: SuggestionStore<EditorBlock>;
  mentionMenu: SuggestionStore<EditorMention> | null;
  blockHandle: BlockHoverStore | null;
};
export type ImageSetup = {
  uploaded: ReadonlySet<string>;
  start: (editor: TiptapEditor, files: File[], at: number) => void;
};

const { dropCursor } = editorStyle();

const placeholderOfTheTextbox = ({ editor }: { editor: TiptapEditor }) =>
  editor.view.dom.getAttribute('aria-placeholder') ?? '';

export function extensionsFor({
  size,
  maxLength,
  markdown,
  features,
  images,
  taskLabel,
  t,
  findMentions,
  withHandle,
}: {
  size: IdsSize;
  maxLength: number | undefined;
  markdown: AnyExtension | undefined;
  features: FeatureExtensions;
  images: ImageSetup;
  taskLabel: (text: string) => string;
  t: Translate;
  findMentions: FindMentions;
  withHandle: boolean;
}): EngineSetup {
  const slashMenu = createSuggestionStore<EditorBlock>(slashMenuKey);
  const mentionMenu = features.mention
    ? createSuggestionStore<EditorMention>(mentionMenuKey)
    : null;

  const blockHandle = withHandle ? createBlockHoverStore() : null;

  const extensions = [
    documentStarterKit([1, 2, 3, 4], { codeBlock: false, dropCursorClass: dropCursor() }),
    EditorCodeBlockNode,
    Placeholder.configure({ placeholder: placeholderOfTheTextbox }),
    CharacterCount.configure({ limit: maxLength }),
    LeaveEscapeToTheLayers,
    CleanPastedHtml,
    EditorImageNode.configure({
      uploaded: images.uploaded,
      insertable: !!features.imageUpload,
      resizable: !markdown,
    }),
    ...(features.imageUpload ? features.imageUpload.imageUploadExtensions(images.start) : []),
    ...(features.highlight ? [features.highlight] : []),
    ...(features.taskList ? features.taskList(taskLabel) : []),
    ...(features.textAlign
      ? [features.textAlign.configure({ types: ['heading', 'paragraph'] })]
      : []),
    ...(features.table ? features.table(size) : []),
    ...(features.callout ? [features.callout] : []),
    ...(features.details ? features.details(size) : []),
    ...(features.mention && mentionMenu
      ? [features.mention.mentionExtension(mentionMenu, findMentions)]
      : []),
    SlashMenu.configure({
      store: slashMenu,
      blocks: (editor, query) =>
        blocksAvailableIn(editor).filter((block) => blockMatches(block, query, t)),
    }),
    ...(blockHandle ? [BlockHandle.configure({ store: blockHandle })] : []),
    ...(markdown ? [markdown] : []),
  ];

  return { extensions, slashMenu, mentionMenu, blockHandle };
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
