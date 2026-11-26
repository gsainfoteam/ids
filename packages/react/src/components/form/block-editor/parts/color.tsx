'use client';

import { renamedPart } from './renamed-part';
import { EditorColor, type EditorColorProps } from '../../editor/parts/color';

export type BlockEditorColorPartProps = EditorColorProps;

export const BlockEditorColorPart = renamedPart<BlockEditorColorPartProps>(
  EditorColor,
  'BlockEditor.Color',
);
