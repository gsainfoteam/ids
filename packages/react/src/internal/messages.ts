import { memoize } from 'es-toolkit';

import { messages } from './messages-catalog';

import type { IdsLocale } from './locale';
import type { editorMessages } from '../components/form/editor/messages-catalog';

export { messages };

export const DEFAULT_LOCALE = 'ko-KR';

type LeafPaths<Tree> = {
  [Key in keyof Tree & string]: Tree[Key] extends string ? Key : `${Key}.${LeafPaths<Tree[Key]>}`;
}[keyof Tree & string];

export type IdsMessageCatalog = typeof messages & typeof editorMessages;

export type IdsMessageKey = LeafPaths<IdsMessageCatalog>;

export type IdsMessageValues = Record<string, string | number>;

type MessageFunction = (values: never) => string;

export type MessageTree = { readonly [name: string]: string | MessageFunction | MessageTree };

const PLACEHOLDER = /\{(\w+)\}/g;

const numbersIn = memoize((tag: string) => new Intl.NumberFormat(tag));

const lookUp = (catalog: MessageTree, key: string) => {
  let node: MessageTree[string] | undefined = catalog;
  for (const name of key.split('.')) node = typeof node === 'object' ? node[name] : undefined;
  return typeof node === 'object' ? undefined : node;
};

const substitute = (message: string, values: IdsMessageValues, tag: string) =>
  message.replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) return placeholder;
    return typeof value === 'number' ? numbersIn(tag).format(value) : value;
  });

export function defaultMessage(key: IdsMessageKey, ownCatalog?: MessageTree): string {
  const message = (ownCatalog && lookUp(ownCatalog, key)) ?? lookUp(messages, key);
  if (typeof message !== 'string') throw new Error(`IDS has no default message for "${key}".`);
  return message;
}

export function formatDefaultMessage(
  key: IdsMessageKey,
  values: IdsMessageValues = {},
  ownCatalog?: MessageTree,
): string {
  return substitute(defaultMessage(key, ownCatalog), values, DEFAULT_LOCALE);
}

export function formatLocaleMessage(
  locale: IdsLocale,
  key: IdsMessageKey,
  values: IdsMessageValues = {},
  tag: string = locale.tag,
): string | undefined {
  for (let current: IdsLocale | undefined = locale; current; current = current.base) {
    const message = lookUp(current.messages as MessageTree, key);
    if (typeof message === 'function')
      return (message as (values: IdsMessageValues) => string)(values);
    if (typeof message === 'string') return substitute(message, values, tag);
  }
  return undefined;
}
