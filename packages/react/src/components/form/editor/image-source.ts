import type { JSONContent } from '@tiptap/core';

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'];

export type ImageUpload = (file: File) => Promise<string>;

const IGNORED_BY_URL_PARSERS = /[\p{Cc}\s]/gu;
const HAS_SCHEME = /^[a-z][a-z\d+.-]*:/i;
const WEB_SCHEME = /^https?:/i;

export function isAllowedImageSource(src: unknown, uploaded: ReadonlySet<string>) {
  if (typeof src !== 'string' || src === '') return false;
  if (uploaded.has(src)) return true;
  const asTheBrowserReadsIt = src.replace(IGNORED_BY_URL_PARSERS, '');
  return !HAS_SCHEME.test(asTheBrowserReadsIt) || WEB_SCHEME.test(asTheBrowserReadsIt);
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

export const isImageFile = (file: File) => IMAGE_TYPES.includes(file.type);
