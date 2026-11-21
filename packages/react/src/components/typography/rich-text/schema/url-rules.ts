import type { JSONContent } from '@tiptap/core';

const IGNORED_BY_URL_PARSERS = /[\p{Cc}\s]/gu;
const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i;
const WEB_SCHEME = /^https?:/i;
const LINK_SCHEME = /^(?:https?|mailto|tel):/i;

const asTheBrowserReadsIt = (url: string) => url.replace(IGNORED_BY_URL_PARSERS, '');

export function isAllowedImageSource(src: unknown, uploaded: ReadonlySet<string>) {
  if (typeof src !== 'string' || src === '') return false;
  if (uploaded.has(src)) return true;
  const read = asTheBrowserReadsIt(src);
  return !HAS_SCHEME.test(read) || WEB_SCHEME.test(read);
}

export const isWebAddress = (url: string) => WEB_SCHEME.test(asTheBrowserReadsIt(url));

export function isAllowedLinkHref(href: unknown) {
  if (typeof href !== 'string' || href === '') return false;
  const read = asTheBrowserReadsIt(href);
  return !HAS_SCHEME.test(read) || LINK_SCHEME.test(read);
}

export function keepAllowedImages(node: JSONContent, uploaded: ReadonlySet<string>): JSONContent {
  if (!node.content) return node;
  return {
    ...node,
    content: node.content
      .filter((child) => child.type !== 'image' || isAllowedImageSource(child.attrs?.src, uploaded))
      .map((child) => keepAllowedImages(child, uploaded)),
  };
}
