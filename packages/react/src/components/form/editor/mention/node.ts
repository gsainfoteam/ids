import { ReactNodeViewRenderer } from '@tiptap/react';

import { EditorMentionView } from './view';
import { DocumentMention } from '../../../typography/rich-text/schema/mention';
import { mentionMenuKey } from '../suggestion/keys';

import type { SuggestionStore } from '../suggestion/store';

export type EditorMention = {
  id: string;
  label: string;
  description?: string;
  avatar?: string;
};

export type FindMentions = (
  query: string,
  signal: AbortSignal,
) => readonly EditorMention[] | Promise<readonly EditorMention[]>;

export function mentionExtension(store: SuggestionStore<EditorMention>, find: FindMentions) {
  return DocumentMention.extend({
    addNodeView: () => ReactNodeViewRenderer(EditorMentionView),
  }).configure({
    suggestion: {
      pluginKey: mentionMenuKey,
      char: '@',
      allow: ({ editor }) => editor.isEditable,
      items: async ({ query, signal }) => [...(await find(query, signal))],
      command: ({ editor, range, props }) => {
        const mention = props as unknown as EditorMention;
        return editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: 'mention',
              attrs: { id: mention.id, label: mention.label, avatar: mention.avatar ?? null },
            },
            { type: 'text', text: ' ' },
          ])
          .run();
      },
      render: store.render,
    },
  });
}
