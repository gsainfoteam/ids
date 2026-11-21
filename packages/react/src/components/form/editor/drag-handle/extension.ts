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

function topLevelStartAt(view: EditorView, pos: number, isNodeStart: boolean) {
  const resolved = view.state.doc.resolve(pos);
  if (resolved.depth > 0) return resolved.before(1);
  return isNodeStart ? pos : null;
}

function blockUnderThePointer(view: EditorView, event: MouseEvent): HoveredBlock | null {
  const hit = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!hit) return null;
  const pos =
    hit.inside >= 0
      ? topLevelStartAt(view, hit.inside, true)
      : topLevelStartAt(view, hit.pos, false);
  if (pos === null) return null;
  const dom = view.nodeDOM(pos);
  return dom instanceof HTMLElement ? { pos, dom } : null;
}

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
              if (!view.editable) {
                store.set(null);
                return false;
              }
              store.set(blockUnderThePointer(view, event) ?? blockNearest(view, event.clientY));
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
