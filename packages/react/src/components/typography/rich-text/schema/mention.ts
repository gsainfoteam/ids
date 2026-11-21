import { createInlineMarkdownSpec } from '@tiptap/core';
import { Mention } from '@tiptap/extension-mention';

import { isAllowedImageSource } from './url-rules';

const ATTRIBUTE = /(?:^|\s)(\w+)=(?:"([^"]*)"|'([^']*)')/g;

function attributesIn(source: string) {
  const attributes: Record<string, string> = {};
  for (const [, key, doubleQuoted, singleQuoted] of source.matchAll(ATTRIBUTE))
    if (key) attributes[key === 'char' ? 'mentionSuggestionChar' : key] = doubleQuoted ?? singleQuoted ?? '';
  return attributes;
}

const NOTHING_UPLOADED: ReadonlySet<string> = new Set();

const safeAvatar = (avatar: unknown) =>
  typeof avatar === 'string' && isAllowedImageSource(avatar, NOTHING_UPLOADED) ? avatar : null;

const shortcodeAttributes = (attributes: Record<string, unknown>) =>
  Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key === 'mentionSuggestionChar' ? 'char' : key}="${String(value)}"`)
    .join(' ');

export const DocumentMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      avatar: {
        default: null,
        parseHTML: (element) => safeAvatar(element.getAttribute('data-avatar')),
        renderHTML: (attributes) => {
          const avatar = safeAvatar(attributes.avatar);
          return avatar ? { 'data-avatar': avatar } : {};
        },
      },
    };
  },

  ...createInlineMarkdownSpec({
    nodeName: 'mention',
    name: '@',
    selfClosing: true,
    allowedAttributes: ['id', 'label', 'avatar', { name: 'mentionSuggestionChar', skipIfDefault: '@' }],
    parseAttributes: (source: string) => {
      const attributes = attributesIn(source);
      return { ...attributes, avatar: safeAvatar(attributes.avatar) };
    },
    serializeAttributes: shortcodeAttributes,
  }),
});
