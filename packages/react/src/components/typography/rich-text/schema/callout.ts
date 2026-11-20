import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core';

import type { JSONContent, MarkdownToken } from '@tiptap/core';

export const CALLOUT_KINDS = ['note', 'tip', 'important', 'warning', 'caution'] as const;

export type CalloutKind = (typeof CALLOUT_KINDS)[number];

export const isCalloutKind = (value: unknown): value is CalloutKind =>
  CALLOUT_KINDS.includes(value as CalloutKind);

export const calloutKindOf = (value: unknown): CalloutKind => {
  const lower = typeof value === 'string' ? value.toLowerCase() : value;
  return isCalloutKind(lower) ? lower : 'note';
};

const GITHUB_ALERT =
  /^ {0,3}> ?\[!(note|tip|important|warning|caution)\][ \t]*(?:\n|$)((?: {0,3}>.*(?:\n|$))*)/i;
const GITHUB_ALERT_START = /^ {0,3}> ?\[!/m;
const QUOTE_MARKER = /^ {0,3}> ?/gm;
const TYPED_ALERT = /^\s*>?\s?\[!(note|tip|important|warning|caution)\]\s$/i;

const quoted = (markdown: string) =>
  markdown
    .split('\n')
    .map((line) => (line.trim() === '' ? '>' : `> ${line}`))
    .join('\n');

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (kind?: CalloutKind) => ReturnType;
      toggleCallout: (kind?: CalloutKind) => ReturnType;
      updateCallout: (kind: CalloutKind) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 'note' satisfies CalloutKind,
        parseHTML: (element) => calloutKindOf(element.getAttribute('data-kind')),
        renderHTML: (attributes) => ({ 'data-kind': calloutKindOf(attributes.kind) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'callout' }, HTMLAttributes), 0];
  },

  markdownTokenizer: {
    name: 'callout',
    level: 'block',
    start: (src) => src.search(GITHUB_ALERT_START),
    tokenize: (src, _tokens, lexer) => {
      const match = GITHUB_ALERT.exec(src);
      if (!match) return undefined;
      const body = (match[2] ?? '').replace(QUOTE_MARKER, '');
      return {
        type: 'callout',
        raw: match[0],
        kind: calloutKindOf(match[1]),
        tokens: lexer.blockTokens(body),
      };
    },
  },

  parseMarkdown: (token: MarkdownToken, helpers) => {
    const children = helpers.parseChildren(token.tokens ?? []);
    const content: JSONContent[] = children.length ? children : [{ type: 'paragraph' }];
    return helpers.createNode('callout', { kind: calloutKindOf(token.kind) }, content);
  },

  renderMarkdown: (node, helpers) => {
    const kind = calloutKindOf(node.attrs?.kind).toUpperCase();
    const body = (node.content ?? []).map((child) => helpers.renderChildren([child])).join('\n\n');
    return `> [!${kind}]\n${quoted(body)}`;
  },

  addCommands() {
    return {
      setCallout:
        (kind = 'note') =>
        ({ commands }) =>
          commands.wrapIn(this.name, { kind }),
      toggleCallout:
        (kind = 'note') =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { kind }),
      updateCallout:
        (kind) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { kind }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: TYPED_ALERT,
        type: this.type,
        getAttributes: (match) => ({ kind: calloutKindOf(match[1]) }),
      }),
    ];
  },
});
