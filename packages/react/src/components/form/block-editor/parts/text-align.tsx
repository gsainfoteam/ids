'use client';

import { renamedPart } from './renamed-part';
import { EditorTextAlign, type EditorTextAlignProps } from '../../editor/parts/text-align';

export type BlockEditorTextAlignPartProps = EditorTextAlignProps;

export const BlockEditorTextAlignPart = renamedPart<BlockEditorTextAlignPartProps>(
  EditorTextAlign,
  'BlockEditor.TextAlign',
);
