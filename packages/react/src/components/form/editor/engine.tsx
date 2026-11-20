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
import { slashMenuKey, mentionMenuKey } from './suggestion/keys';
import { createSuggestionStore, type SuggestionStore } from './suggestion/store';
import { documentStarterKit } from '../../typography/rich-text/schema/starter-kit';

import type { FeatureExtensions } from './load-engine';
import type { EditorMention, FindMentions } from './mention';
import type { Translate } from '../../../internal/translate';
import type { AnyExtension, Editor as TiptapEditor, Extensions } from '@tiptap/core';
import type { ImageOptions } from '@tiptap/extension-image';

export { EditorContent };
export { EditorSlashMenu } from './slash/menu';
export { EditorBlockHandle } from './drag-handle/handle';

export type EngineSetup = {
  extensions: Extensions;
  slashMenu: SuggestionStore<EditorBlock>;
  mentionMenu: SuggestionStore<EditorMention> | null;
  blockHandle: BlockHoverStore;
};
export type ImageSetup = {
  uploaded: ReadonlySet<string>;
  start: (editor: TiptapEditor, files: File[], at: number) => void;
};

const IMAGE_RESIZE = {
  enabled: true,
  directions: ['left', 'right'],
  minWidth: 48,
  alwaysPreserveAspectRatio: true,
} as const satisfies ImageOptions['resize'];

const placeholderOfTheTextbox = ({ editor }: { editor: TiptapEditor }) =>
  editor.view.dom.getAttribute('aria-placeholder') ?? '';

export function extensionsFor({
  maxLength,
  markdown,
  features,
  images,
  taskLabel,
  t,
  findMentions,
}: {
  maxLength: number | undefined;
  markdown: AnyExtension | undefined;
  features: FeatureExtensions;
  images: ImageSetup;
  taskLabel: (text: string) => string;
  t: Translate;
  findMentions: FindMentions;
}): EngineSetup {
  const slashMenu = createSuggestionStore<EditorBlock>(slashMenuKey);
  const mentionMenu = features.mention
    ? createSuggestionStore<EditorMention>(mentionMenuKey)
    : null;

  const blockHandle = createBlockHoverStore();

  const extensions = [
    documentStarterKit([1, 2, 3, 4], { codeBlock: false }),
    EditorCodeBlockNode,
    Placeholder.configure({ placeholder: placeholderOfTheTextbox }),
    CharacterCount.configure({ limit: maxLength }),
    LeaveEscapeToTheLayers,
    CleanPastedHtml,
    EditorImageNode.configure({
      uploaded: images.uploaded,
      insertable: !!features.imageUpload,
      resize: markdown ? false : IMAGE_RESIZE,
    }),
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
    ...(features.mention && mentionMenu
      ? [features.mention.mentionExtension(mentionMenu, findMentions)]
      : []),
    SlashMenu.configure({
      store: slashMenu,
      blocks: (editor, query) =>
        blocksAvailableIn(editor).filter((block) => blockMatches(block, query, t)),
    }),
    BlockHandle.configure({ store: blockHandle }),
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
