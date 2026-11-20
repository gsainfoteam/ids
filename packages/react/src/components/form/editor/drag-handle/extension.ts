import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { minBy } from 'es-toolkit';

import type { BlockHoverStore, HoveredBlock } from './store';
import type { EditorView } from '@tiptap/pm/view';

const blockHandleKey = new PluginKey('idsBlockHandle');

function topLevelBlocks(view: EditorView) {
  const blocks: HoveredBlock[] = [];
  view.state.doc.forEach((_, pos) => {
    const dom = view.nodeDOM(pos);
    if (dom instanceof HTMLElement) blocks.push({ pos, dom });
  });
  return blocks;
}

function distanceFromTheRows(dom: HTMLElement, y: number) {
  const { top, bottom } = dom.getBoundingClientRect();
  return y < top ? top - y : y > bottom ? y - bottom : 0;
}

const blockNearest = (view: EditorView, y: number) =>
  minBy(topLevelBlocks(view), (block) => distanceFromTheRows(block.dom, y)) ?? null;

export const BlockHandle = Extension.create<{ store: BlockHoverStore | null }>({
  name: 'idsBlockHandle',

  addOptions() {
    return { store: null };
  },

  addProseMirrorPlugins() {
    const { store } = this.options;
    if (!store) return [];

    return [
      new Plugin({
        key: blockHandleKey,
        props: {
          handleDOMEvents: {
            mousemove: (view, event) => {
              store.set(view.editable ? blockNearest(view, event.clientY) : null);
              return false;
            },
          },
        },
        view: () => ({
          update: (view, previous) => {
            if (!view.state.doc.eq(previous.doc)) store.set(null);
          },
          destroy: () => store.set(null),
        }),
      }),
    ];
  },
});
