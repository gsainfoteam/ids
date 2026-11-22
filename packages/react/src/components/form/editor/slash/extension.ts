import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

import { slashMenuKey } from '../suggestion/keys';

import type { EditorBlock } from '../blocks/catalog';
import type { SuggestionStore } from '../suggestion/store';
import type { Range, Editor as TiptapEditor } from '@tiptap/core';
import type { EditorState } from '@tiptap/pm/state';

export type SlashMenuOptions = {
  store: SuggestionStore<EditorBlock> | null;
  blocks: (editor: TiptapEditor, query: string) => EditorBlock[];
};

const queryIn = (state: EditorState, range: Range) =>
  state.doc.textBetween(range.from + 1, range.to);

const stillLooksForABlock = (matches: readonly EditorBlock[], query: string) =>
  matches.length > 0 || !/\s/.test(query);

export const SlashMenu = Extension.create<SlashMenuOptions>({
  name: 'idsSlashMenu',

  addOptions() {
    return { store: null, blocks: () => [] };
  },

  addProseMirrorPlugins() {
    const { store, blocks } = this.options;
    if (!store) return [];

    return [
      Suggestion<EditorBlock, EditorBlock>({
        editor: this.editor,
        pluginKey: slashMenuKey,
        char: '/',
        allowSpaces: true,
        allow: ({ editor, state, range }) =>
          editor.isEditable &&
          !state.doc.resolve(range.from).parent.type.spec.code &&
          stillLooksForABlock(blocks(editor, queryIn(state, range)), queryIn(state, range)),
        items: ({ editor, query }) => blocks(editor, query),
        command: ({ editor, range, props: block }) =>
          block.insert(editor.chain().focus().deleteRange(range)).run(),
        render: store.render,
      }),
    ];
  },
});
