export type AccordionType = 'single' | 'multiple';

export type AccordionValue<T extends string = string> = T | null | readonly T[];

export function openValues<T extends string>(value: AccordionValue<T> | undefined): readonly T[] {
  if (value == null) return [];
  return typeof value === 'string' ? [value] : value;
}

export function toggleValue<T extends string>(
  type: AccordionType,
  value: AccordionValue<T>,
  item: T,
  collapsible: boolean,
): AccordionValue<T> {
  const open = openValues(value);
  if (type === 'multiple')
    return open.includes(item) ? open.filter((entry) => entry !== item) : [...open, item];
  if (open.includes(item)) return collapsible ? null : item;
  return item;
}

export function revealValue<T extends string>(
  type: AccordionType,
  value: AccordionValue<T>,
  item: T,
): AccordionValue<T> {
  const open = openValues(value);
  if (open.includes(item)) return value;
  return type === 'multiple' ? [...open, item] : item;
}

const MOVES: Record<string, (index: number, count: number) => number> = {
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_, count) => count - 1,
};

export function nextTriggerIndex(key: string, index: number, count: number) {
  const move = MOVES[key];
  if (move === undefined || count === 0) return null;
  return move(index, count);
}
