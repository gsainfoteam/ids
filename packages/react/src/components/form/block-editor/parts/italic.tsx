'use client';

import { renamedPart } from './renamed-part';
import { EditorItalic, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorItalicPartProps = EditorMarkProps;

export const BlockEditorItalicPart = renamedPart<BlockEditorItalicPartProps>(
  EditorItalic,
  'BlockEditor.Italic',
);
