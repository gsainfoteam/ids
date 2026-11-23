import parser, { type Node, type Selector } from 'postcss-selector-parser';

export const attribute = (name: string, value?: string, operator: '=' | '*=' = '=') => {
  const node = parser.attribute({ attribute: name, raws: {}, value: undefined });
  if (value !== undefined) {
    node.operator = operator;
    node.setValue(value, { quoteMark: '"' });
  }
  return node;
};

export const className = (name: string) => {
  const node = parser.className({ value: '' });
  node.value = name;
  return node;
};

export const nesting = () => parser.nesting({ value: '&' });

export const universal = () => parser.universal({ value: '*' });

export const descendant = () => parser.combinator({ value: ' ' });

export const compound = (...nodes: Node[]) => parser.selector({ nodes, value: '' });

const LIST_SEPARATOR_SPACE = ' ';

const spacedAfterCommas = (selectors: Selector[]) =>
  selectors.map((selector, index) => {
    if (index > 0) selector.spaces.before = LIST_SEPARATOR_SPACE;
    return selector;
  });

export const pseudo = (name: string, ...selectors: Selector[]) =>
  parser.pseudo({ value: name, nodes: spacedAfterCommas(selectors) });

export const PSEUDO = {
  where: ':where',
  is: ':is',
  not: ':not',
  has: ':has',
  focusVisible: ':focus-visible',
} as const;

export const selectorList = (...selectors: Selector[]) =>
  parser.root({ nodes: spacedAfterCommas(selectors), value: '' }).toString();
