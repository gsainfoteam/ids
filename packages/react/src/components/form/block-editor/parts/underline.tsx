'use client';

import { renamedPart } from './renamed-part';
import { EditorUnderline, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorUnderlinePartProps = EditorMarkProps;

export const BlockEditorUnderlinePart = renamedPart<BlockEditorUnderlinePartProps>(
  EditorUnderline,
  'BlockEditor.Underline',
);
