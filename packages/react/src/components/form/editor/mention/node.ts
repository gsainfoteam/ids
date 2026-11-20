import { Mention } from '@tiptap/extension-mention';

import { mentionChip } from '../../../typography/rich-text/style';
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
  return Mention.configure({
    HTMLAttributes: { class: mentionChip },
    suggestion: {
      pluginKey: mentionMenuKey,
      char: '@',
      allow: ({ editor }) => editor.isEditable,
      items: async ({ query, signal }) => [...(await find(query, signal))],
      command: ({ editor, range, props: mention }) =>
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            { type: 'mention', attrs: { id: mention.id, label: mention.label } },
            { type: 'text', text: ' ' },
          ])
          .run(),
      render: store.render,
    },
  });
}
