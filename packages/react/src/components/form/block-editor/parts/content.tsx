'use client';

import { renamedPart } from './renamed-part';
import { EditorContentPart, type EditorContentProps } from '../../editor/parts/content';

export type BlockEditorContentPartProps = EditorContentProps;

export const BlockEditorContentPart = renamedPart<BlockEditorContentPartProps>(
  EditorContentPart,
  'BlockEditor.Content',
);
