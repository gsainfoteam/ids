import { findChildren } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import {
  highlightLines,
  isLazy,
  lazyLanguagesLoaded,
  loadLazyLanguages,
  subscribeToLazyLanguages,
  type CodeLine,
} from '../../../data/code-block/highlight';

import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const codeHighlightKey = new PluginKey<DecorationSet>('idsCodeHighlight');
const LAZY_LANGUAGES_ARRIVED = 'lazyLanguagesArrived';

type Highlighted = { lazyLoaded: boolean; lines: CodeLine[] };

const highlightedBlocks = new WeakMap<ProseMirrorNode, Highlighted>();

function linesOf(block: ProseMirrorNode, lazyLoaded: boolean) {
  const cached = highlightedBlocks.get(block);
  if (cached && cached.lazyLoaded === lazyLoaded) return cached.lines;
  const lines = highlightLines(block.textContent, block.attrs.language ?? '', lazyLoaded);
  highlightedBlocks.set(block, { lazyLoaded, lines });
  return lines;
}

const codeBlocksIn = (doc: ProseMirrorNode) =>
  findChildren(doc, (node) => node.type.name === 'codeBlock');

function tokenDecorations(lines: CodeLine[], start: number) {
  let at = start;
  return lines.flatMap((line, index) => {
    if (index > 0) at += 1;
    return line.flatMap((segment) => {
      const from = at;
      at += segment.text.length;
      return segment.token ? [Decoration.inline(from, at, { 'data-token': segment.token })] : [];
    });
  });
}

function decorationsOf(doc: ProseMirrorNode) {
  const lazyLoaded = lazyLanguagesLoaded();
  return DecorationSet.create(
    doc,
    codeBlocksIn(doc).flatMap(({ node, pos }) =>
      tokenDecorations(linesOf(node, lazyLoaded), pos + 1),
    ),
  );
}

const needsLazyLanguages = (doc: ProseMirrorNode) =>
  codeBlocksIn(doc).some(({ node }) => isLazy(node.attrs.language ?? ''));

export const codeHighlight = new Plugin<DecorationSet>({
  key: codeHighlightKey,
  state: {
    init: (_, state) => decorationsOf(state.doc),
    apply: (tr, decorations) =>
      tr.docChanged || tr.getMeta(codeHighlightKey) === LAZY_LANGUAGES_ARRIVED
        ? decorationsOf(tr.doc)
        : decorations,
  },
  props: {
    decorations: (state) => codeHighlightKey.getState(state),
  },
  view: (view) => {
    const redraw = () => {
      if (!view.isDestroyed)
        view.dispatch(view.state.tr.setMeta(codeHighlightKey, LAZY_LANGUAGES_ARRIVED));
    };
    const unsubscribe = subscribeToLazyLanguages(redraw);
    const loadWhenNeeded = (doc: ProseMirrorNode) => {
      if (!lazyLanguagesLoaded() && needsLazyLanguages(doc)) loadLazyLanguages();
    };
    loadWhenNeeded(view.state.doc);

    return {
      update: (updated, previous) => {
        if (updated.state.doc !== previous.doc) loadWhenNeeded(updated.state.doc);
      },
      destroy: unsubscribe,
    };
  },
});
