import { messages } from './messages-catalog';

export { messages };

export const DEFAULT_LOCALE = 'ko-KR';

type LeafPaths<Tree> = {
  [Key in keyof Tree & string]: Tree[Key] extends string ? Key : `${Key}.${LeafPaths<Tree[Key]>}`;
}[keyof Tree & string];

export type IdsMessageKey = LeafPaths<typeof messages>;

export type IdsMessageValues = Record<string, string | number>;

const PLACEHOLDER = /\{(\w+)\}/g;

const koreanNumbers = new Intl.NumberFormat(DEFAULT_LOCALE);

type MessageTree = { readonly [name: string]: string | MessageTree };

export function defaultMessage(key: IdsMessageKey): string {
  let node: string | MessageTree = messages;
  for (const name of key.split('.')) node = (node as MessageTree)[name];
  return node as string;
}

export function formatDefaultMessage(key: IdsMessageKey, values: IdsMessageValues = {}): string {
  return defaultMessage(key).replace(PLACEHOLDER, (placeholder, name: string) => {
    const value = values[name];
    if (value === undefined) return placeholder;
    return typeof value === 'number' ? koreanNumbers.format(value) : value;
  });
}
