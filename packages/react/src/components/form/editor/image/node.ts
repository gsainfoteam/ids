import { Fragment, Slice, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';

import {
  DocumentImage,
  type DocumentImageOptions,
} from '../../../typography/rich-text/schema/image';

function withoutImages(fragment: Fragment): Fragment {
  const kept: ProseMirrorNode[] = [];
  fragment.forEach((node) => {
    if (node.type.name === 'image') return;
    kept.push(node.isLeaf ? node : node.copy(withoutImages(node.content)));
  });
  return Fragment.from(kept);
}

const pastedImagesAreDropped = new Plugin({
  props: {
    transformPasted: (slice, view) => {
      if (view.dragging) return slice;
      const content = withoutImages(slice.content);
      return content.size === 0 ? Slice.empty : new Slice(content, slice.openStart, slice.openEnd);
    },
  },
});

export const EditorImageNode = DocumentImage.extend<DocumentImageOptions & { insertable: boolean }>(
  {
    addOptions() {
      return { ...(this.parent?.() as DocumentImageOptions), insertable: false };
    },

    addProseMirrorPlugins() {
      return this.options.insertable ? [] : [pastedImagesAreDropped];
    },
  },
);
