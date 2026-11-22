import { messages } from './messages-catalog';

import type { editorMessages } from '../components/form/editor/messages-catalog';

export { messages };

export const DEFAULT_LOCALE = 'ko-KR';

type LeafPaths<Tree> = {
  [Key in keyof Tree & string]: Tree[Key] extends string ? Key : `${Key}.${LeafPaths<Tree[Key]>}`;
}[keyof Tree & string];

export type IdsMessageCatalog = typeof messages & typeof editorMessages;

export type IdsMessageKey = LeafPaths<IdsMessageCatalog>;

export type IdsMessageValues = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

const koreanNumbers = new Intl.NumberFormat(DEFAULT_LOCALE);

export type MessageTree = { readonly [name: string]: string | MessageTree };

const lookUp = (catalog: MessageTree, key: string) => {
  let node: string | MessageTree | undefined = catalog;
  for (const name of key.split('.')) node = typeof node === 'object' ? node[name] : undefined;
  return typeof node === 'string' ? node : undefined;
};

export function defaultMessage(key: IdsMessageKey, ownCatalog?: MessageTree): string {
  const message = (ownCatalog && lookUp(ownCatalog, key)) ?? lookUp(messages, key);
  if (message === undefined) throw new Error(`IDS has no default message for "${key}".`);
  return message;
}

export function formatDefaultMessage(
  key: IdsMessageKey,
  values: IdsMessageValues = {},
  ownCatalog?: MessageTree,
): string {
  return defaultMessage(key, ownCatalog).replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) return placeholder;
    return typeof value === 'number' ? koreanNumbers.format(value) : value;
  });
}
