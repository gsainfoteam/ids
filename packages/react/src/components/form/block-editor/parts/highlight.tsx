'use client';

import { renamedPart } from './renamed-part';
import { EditorHighlight, type EditorMarkProps } from '../../editor/parts/marks';

export type BlockEditorHighlightPartProps = EditorMarkProps;

export const BlockEditorHighlightPart = renamedPart<BlockEditorHighlightPartProps>(
  EditorHighlight,
  'BlockEditor.Highlight',
);
