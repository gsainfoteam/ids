'use client';

import { renamedPart } from './renamed-part';
import { EditorLink, type EditorLinkProps } from '../../editor/parts/link';

export type BlockEditorLinkPartProps = EditorLinkProps;

export const BlockEditorLinkPart = renamedPart<BlockEditorLinkPartProps>(
  EditorLink,
  'BlockEditor.Link',
);
