'use client';

import { renamedPart } from './renamed-part';
import { EditorCount, type EditorCountProps } from '../../editor/parts/count';

export type BlockEditorCountPartProps = EditorCountProps;

export const BlockEditorCountPart = renamedPart<BlockEditorCountPartProps>(
  EditorCount,
  'BlockEditor.Count',
);
