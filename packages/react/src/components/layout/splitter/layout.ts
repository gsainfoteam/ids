export type PanelConstraints = {
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  collapsedSize: number;
};

const FRACTION_DIGITS_ZAG_COMPARES = 10;
const WHOLE = 100;

const compare = (a: number, b: number) => {
  if (a.toFixed(FRACTION_DIGITS_ZAG_COMPARES) === b.toFixed(FRACTION_DIGITS_ZAG_COMPARES)) return 0;
  return a > b ? 1 : -1;
};

export const sameSize = (a: number, b: number) => compare(a, b) === 0;

const sum = (sizes: readonly number[]) => sizes.reduce((total, size) => total + size, 0);

const smallestOf = (panel: PanelConstraints) =>
  panel.collapsible ? Math.min(panel.collapsedSize, panel.minSize) : panel.minSize;

export function isCollapsed(panel: PanelConstraints, size: number) {
  return panel.collapsible && sameSize(size, panel.collapsedSize);
}

export function fitPanel(panel: PanelConstraints, size: number) {
  const { minSize, maxSize, collapsible, collapsedSize } = panel;
  const snapsShut = collapsible && compare(size, (collapsedSize + minSize) / 2) < 0;
  const floored = compare(size, minSize) < 0 ? (snapsShut ? collapsedSize : minSize) : size;
  return Number(Math.min(maxSize, floored).toFixed(FRACTION_DIGITS_ZAG_COMPARES));
}

export function fillSizes(given: ReadonlyArray<number | undefined>, count: number) {
  const sizes = Array.from({ length: count }, (_, index) => given[index]);
  const unset = sizes.filter((size) => size === undefined).length;
  const share = Math.max(0, WHOLE - sum(sizes.map((size) => size ?? 0))) / Math.max(unset, 1);
  return sizes.map((size) => size ?? share);
}

const indicesFrom = (start: number, step: 1 | -1, count: number) => {
  const indices: number[] = [];
  for (let index = start; index >= 0 && index < count; index += step) indices.push(index);
  return indices;
};

export function moveHandle(
  start: readonly number[],
  panels: readonly PanelConstraints[],
  handle: number,
  delta: number,
): number[] | null {
  if (sameSize(delta, 0)) return [...start];

  const count = panels.length;
  const growing = delta > 0 ? indicesFrom(handle, -1, count) : indicesFrom(handle + 1, 1, count);
  const shrinking = delta > 0 ? indicesFrom(handle + 1, 1, count) : indicesFrom(handle, -1, count);
  const room = sum(growing.map((index) => fitPanel(panels[index]!, WHOLE) - start[index]!));
  const wanted = Math.min(Math.abs(delta), Math.abs(room));

  const next = [...start];
  let taken = 0;
  for (const index of shrinking) {
    if (compare(taken, wanted) >= 0) break;
    next[index] = fitPanel(panels[index]!, start[index]! - (wanted - taken));
    taken += start[index]! - next[index]!;
  }

  let owed = taken;
  for (const index of growing) {
    if (sameSize(owed, 0)) break;
    const grown = fitPanel(panels[index]!, next[index]! + owed);
    owed -= grown - next[index]!;
    next[index] = grown;
  }

  return sameSize(sum(next), WHOLE) ? next : null;
}

export function keyTarget(
  sizes: readonly number[],
  panels: readonly PanelConstraints[],
  handle: number,
  delta: number,
) {
  const grower = delta > 0 ? handle : handle + 1;
  const shrinker = delta > 0 ? handle + 1 : handle;
  const opensToMin = isCollapsed(panels[grower]!, sizes[grower]!)
    ? panels[grower]!.minSize - sizes[grower]!
    : 0;
  const shutsFromMin =
    panels[shrinker]!.collapsible && sameSize(sizes[shrinker]!, panels[shrinker]!.minSize)
      ? sizes[shrinker]! - panels[shrinker]!.collapsedSize
      : 0;
  const reach = Math.max(Math.abs(delta), opensToMin, shutsFromMin);

  return sizes[handle]! + Math.sign(delta) * reach;
}

export function handleRange(
  sizes: readonly number[],
  panels: readonly PanelConstraints[],
  handle: number,
) {
  const panel = panels[handle]!;
  const others = panels.filter((_, index) => index !== handle);

  return {
    now: sizes[handle] ?? 0,
    min: Math.max(smallestOf(panel), WHOLE - sum(others.map((other) => other.maxSize))),
    max: Math.min(panel.maxSize, WHOLE - sum(others.map(smallestOf))),
  };
}
