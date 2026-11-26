'use client';

import { renamedPart } from './renamed-part';
import { EditorSubscript, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorSubscriptPartProps = EditorMarkProps;

export const BlockEditorSubscriptPart = renamedPart<BlockEditorSubscriptPartProps>(
  EditorSubscript,
  'BlockEditor.Subscript',
);
