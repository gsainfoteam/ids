'use client';

import { renamedPart } from './renamed-part';
import { EditorCode, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorCodePartProps = EditorMarkProps;

export const BlockEditorCodePart = renamedPart<BlockEditorCodePartProps>(
  EditorCode,
  'BlockEditor.Code',
);
