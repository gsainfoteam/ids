import { Image, type ImageOptions } from '@tiptap/extension-image';

import { isAllowedImageSource } from './url-rules';

export type DocumentImageOptions = ImageOptions & { uploaded: ReadonlySet<string> };

export const DocumentImage = Image.extend<DocumentImageOptions>({
  addOptions() {
    return { ...(this.parent?.() as ImageOptions), uploaded: new Set<string>() };
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
});
