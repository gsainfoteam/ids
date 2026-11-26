'use client';

import { renamedPart } from './renamed-part';
import { EditorBold, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorBoldPartProps = EditorMarkProps;

export const BlockEditorBoldPart = renamedPart<BlockEditorBoldPartProps>(
  EditorBold,
  'BlockEditor.Bold',
);
