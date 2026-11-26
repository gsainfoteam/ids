'use client';

import { renamedPart } from './renamed-part';
import { EditorSeparator, type EditorSeparatorProps } from '../../editor/parts/separator';

export type BlockEditorSeparatorPartProps = EditorSeparatorProps;

export const BlockEditorSeparatorPart = renamedPart<BlockEditorSeparatorPartProps>(
  EditorSeparator,
  'BlockEditor.Separator',
);
