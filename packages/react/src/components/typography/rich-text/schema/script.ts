import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';

import type { Mark } from '@tiptap/core';

const escapeForRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function asHtmlTagInMarkdown<Options>(mark: Mark<Options>, tag: 'sub' | 'sup') {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const tagged = new RegExp(
    `^${escapeForRegExp(open)}(?!\\s)([^<]*[^<\\s])${escapeForRegExp(close)}`,
  );

  return mark.extend({
    renderMarkdown: (node, h) => `${open}${h.renderChildren(node)}${close}`,
    parseMarkdown: (token, h) => h.applyMark(mark.name, h.parseInline(token.tokens ?? [])),
    markdownTokenizer: {
      name: mark.name,
      level: 'inline',
      start: (src: string) => src.indexOf(open),
      tokenize(src, _, h) {
        const match = tagged.exec(src);
        if (!match) return undefined;
        return {
          type: mark.name,
          raw: match[0],
          text: match[1],
          tokens: h.inlineTokens(match[1]!),
        };
      },
    },
  });
}

export const DocumentSubscript = asHtmlTagInMarkdown(Subscript, 'sub');

export const DocumentSuperscript = asHtmlTagInMarkdown(Superscript, 'sup');
