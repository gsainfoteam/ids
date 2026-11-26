'use client';

import { renamedPart } from './renamed-part';
import { EditorSuperscript, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorSuperscriptPartProps = EditorMarkProps;

export const BlockEditorSuperscriptPart = renamedPart<BlockEditorSuperscriptPartProps>(
  EditorSuperscript,
  'BlockEditor.Superscript',
);
