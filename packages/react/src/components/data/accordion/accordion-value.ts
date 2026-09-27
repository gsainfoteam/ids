export type AccordionType = 'single' | 'multiple';

export type AccordionValue<T extends string = string> = T | null | readonly T[];

export function openValues<T extends string>(value: AccordionValue<T> | undefined): readonly T[] {
  if (value == null) return [];
  return typeof value === 'string' ? [value] : value;
}

// A single accordion that is not collapsible keeps its open item open: pressing that trigger
// again changes nothing.
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

// Opening never closes the item itself, only the other item of a single accordion. Used when the
// browser reveals a collapsed panel for find-in-page.
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

// WAI-ARIA APG accordion: arrows move between headers and wrap, Home and End jump to the ends.
export function nextTriggerIndex(key: string, index: number, count: number) {
  const move = MOVES[key];
  if (move === undefined || count === 0) return null;
  return move(index, count);
}
