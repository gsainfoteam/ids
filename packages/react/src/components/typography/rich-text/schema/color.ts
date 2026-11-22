import {
  Mark,
  type JSONContent,
  type MarkdownLexerConfiguration,
  type MarkdownParseHelpers,
  type MarkdownToken,
} from '@tiptap/core';
import { Highlight } from '@tiptap/extension-highlight';

import { isDocumentColor, type DocumentColor } from '../document-colors';

const colorAttribute = {
  color: {
    default: null,
    parseHTML: (element: HTMLElement) => {
      const color = element.getAttribute('data-color');
      return isDocumentColor(color) ? color : null;
    },
    renderHTML: ({ color }: { color?: unknown }) =>
      isDocumentColor(color) ? { 'data-color': color } : {},
  },
};

const COLORED_TAG = (tag: string) =>
  new RegExp(`^<${tag} data-color="([a-z]+)">(?!\\s)([^<]*[^<\\s])</${tag}>`);
const COLORED_MARK = COLORED_TAG('mark');
const COLORED_SPAN = COLORED_TAG('span');
const DOUBLE_EQUALS = /^(==)(?!\s)([^=]*[^=\s])(==)/;

const coloredToken = (
  type: string,
  [raw, color, text]: string[],
  helpers: MarkdownLexerConfiguration,
): MarkdownToken => ({
  type,
  raw: raw!,
  text: text!,
  color: isDocumentColor(color) ? color : undefined,
  tokens: helpers.inlineTokens(text!),
});

const firstIndexOf = (src: string, ...needles: string[]) => {
  const found = needles.map((needle) => src.indexOf(needle)).filter((index) => index >= 0);
  return found.length > 0 ? Math.min(...found) : -1;
};

const markedWithColor = (name: string, token: MarkdownToken, helpers: MarkdownParseHelpers) =>
  helpers.applyMark(
    name,
    helpers.parseInline(token.tokens ?? []),
    isDocumentColor(token.color) ? { color: token.color } : undefined,
  );

const colorOf = (node: JSONContent) => {
  const color: unknown = node.attrs?.color;
  return isDocumentColor(color) ? color : null;
};

export const DocumentHighlight = Highlight.extend({
  addAttributes: () => colorAttribute,
  renderMarkdown: (node, h) => {
    const color = colorOf(node);
    const inner = h.renderChildren(node);
    return color ? `<mark data-color="${color}">${inner}</mark>` : `==${inner}==`;
  },
  parseMarkdown: (token, h) => markedWithColor('highlight', token, h),
  markdownTokenizer: {
    name: 'highlight',
    level: 'inline',
    start: (src: string) => firstIndexOf(src, '==', '<mark data-color='),
    tokenize(src, _, h) {
      const colored = COLORED_MARK.exec(src);
      if (colored) return coloredToken('highlight', [...colored], h);
      const plain = DOUBLE_EQUALS.exec(src);
      if (plain) return coloredToken('highlight', [plain[0], '', plain[2]!], h);
      return undefined;
    },
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textColor: {
      setTextColor: (color: DocumentColor) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
  }
}

export const DocumentTextColor = Mark.create({
  name: 'textColor',

  addAttributes: () => colorAttribute,

  parseHTML: () => [
    {
      tag: 'span[data-color]',
      getAttrs: (element) => (isDocumentColor(element.getAttribute('data-color')) ? null : false),
    },
  ],

  renderHTML: ({ HTMLAttributes }) => ['span', HTMLAttributes, 0],

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetTextColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },

  renderMarkdown: (node, h) => {
    const color = colorOf(node);
    const inner = h.renderChildren(node);
    return color ? `<span data-color="${color}">${inner}</span>` : inner;
  },

  parseMarkdown: (token, h) => markedWithColor('textColor', token, h),

  markdownTokenizer: {
    name: 'textColor',
    level: 'inline',
    start: (src: string) => src.indexOf('<span data-color='),
    tokenize(src, _, h) {
      const match = COLORED_SPAN.exec(src);
      return match ? coloredToken('textColor', [...match], h) : undefined;
    },
  },
});
