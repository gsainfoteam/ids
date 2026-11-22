'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { MentionChip } from '../../../typography/rich-text/nodes/mention';

export function EditorMentionView({ node }: ReactNodeViewProps) {
  const { id, label, avatar } = node.attrs as { id?: string; label?: string; avatar?: string };

  return (
    <NodeViewWrapper as="span" data-mention="">
      <MentionChip label={label ?? id ?? ''} avatar={avatar} />
    </NodeViewWrapper>
  );
}
