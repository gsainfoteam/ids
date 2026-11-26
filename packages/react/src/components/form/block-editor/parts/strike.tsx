'use client';

import { renamedPart } from './renamed-part';
import { EditorStrike, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorStrikePartProps = EditorMarkProps;

export const BlockEditorStrikePart = renamedPart<BlockEditorStrikePartProps>(
  EditorStrike,
  'BlockEditor.Strike',
);
