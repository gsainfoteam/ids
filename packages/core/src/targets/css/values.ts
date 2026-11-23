import valueParser, { type Node } from 'postcss-value-parser';

export type Value = Node[];

const AT_START = { sourceIndex: 0, sourceEndIndex: 0 };

export const word = (value: string): Node => ({ type: 'word', value, ...AT_START });

export const string = (value: string): Node => ({ type: 'string', value, quote: '"', ...AT_START });

const space = (): Node => ({ type: 'space', value: ' ', ...AT_START });

const comma = (): Node => ({ type: 'div', value: ',', before: '', after: ' ', ...AT_START });

const joined = (separator: () => Node[], parts: readonly Value[]): Value =>
  parts.flatMap((part, index) => (index === 0 ? part : [...separator(), ...part]));

export const spaced = (...parts: Value[]) => joined(() => [space()], parts);

export const commas = (...parts: Value[]) => joined(() => [comma()], parts);

const operator = (symbol: string) => () => [space(), word(symbol), space()];

export const product = (...factors: Value[]) => joined(operator('*'), factors);

export const call = (name: string, ...args: Value[]): Value => [
  { type: 'function', value: name, before: '', after: '', nodes: commas(...args), ...AT_START },
];

export const variable = (property: string, fallback?: Value): Value =>
  call('var', [word(property)], ...(fallback ? [fallback] : []));

export const serialize = (value: Value) => valueParser.stringify(value);
