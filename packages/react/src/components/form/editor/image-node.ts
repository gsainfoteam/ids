import { Image, type ImageOptions } from '@tiptap/extension-image';
import { Fragment, Slice, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';

import { isAllowedImageSource } from './image-source';

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

type EditorImageOptions = ImageOptions & {
  uploaded: ReadonlySet<string>;
  insertable: boolean;
};

export const EditorImageNode = Image.extend<EditorImageOptions>({
  addOptions() {
    return {
      ...(this.parent?.() as ImageOptions),
      uploaded: new Set<string>(),
      insertable: false,
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) =>
          isAllowedImageSource(element.getAttribute('src'), this.options.uploaded) ? null : false,
      },
    ];
  },

  parseMarkdown(token, helpers) {
    if (!isAllowedImageSource(token.href, this.options.uploaded)) return [];
    return helpers.createNode('image', { src: token.href, title: token.title, alt: token.text });
  },

  addInputRules() {
    return [];
  },

  addProseMirrorPlugins() {
    return this.options.insertable ? [] : [pastedImagesAreDropped];
  },
});
