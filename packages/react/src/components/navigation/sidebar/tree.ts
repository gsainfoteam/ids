export type SidebarTreeId = string | number;

export type SidebarTreeItem<T> = { id: SidebarTreeId; children?: readonly T[] };

export type SidebarPlace<T> = {
  parent: T | null;
  ancestors: readonly T[];
  index: number;
  previousSibling: T | null;
  nextSibling: T | null;
};

export type SidebarMove<T> = { item: T; from: SidebarPlace<T>; to: SidebarPlace<T> };

export type SidebarDropPosition = 'before' | 'after' | 'inside';

export type SidebarDrop = { key: string; position: SidebarDropPosition };

export type SidebarTreeMove = { key: string; parent: string | null; index: number };

export type SidebarTreeNode<T> = {
  key: string;
  item: T;
  path: SidebarTreeId[];
  parent: string | null;
  index: number;
  children: string[];
  depth: number;
};

export type SidebarTree<T> = {
  nodes: Map<string, SidebarTreeNode<T>>;
  roots: string[];
  duplicates: SidebarTreeId[];
};

export const TREE_KEY_PROP = 'data-sidebar-tree-key';

const ROOT = null;
const OUTER_EDGE = 0.25;
const HALF = 0.5;

export const treeKeyOf = (path: readonly SidebarTreeId[]) => JSON.stringify(path);

export function buildTree<T extends SidebarTreeItem<T>>(items: readonly T[]): SidebarTree<T> {
  const nodes = new Map<string, SidebarTreeNode<T>>();
  const duplicates: SidebarTreeId[] = [];

  const visit = (list: readonly T[], parent: SidebarTreeNode<T> | null): string[] =>
    list.flatMap((item, index) => {
      const path = [...(parent?.path ?? []), item.id];
      const key = treeKeyOf(path);
      if (nodes.has(key)) {
        duplicates.push(item.id);
        return [];
      }

      const node: SidebarTreeNode<T> = {
        key,
        item,
        path,
        parent: parent?.key ?? ROOT,
        index,
        children: [],
        depth: path.length - 1,
      };
      nodes.set(key, node);
      node.children = visit(item.children ?? [], node);
      return [key];
    });

  return { nodes, roots: visit(items, null), duplicates };
}

export function siblingKeysOf<T>(tree: SidebarTree<T>, parent: string | null) {
  return parent === ROOT ? tree.roots : (tree.nodes.get(parent)?.children ?? []);
}

export function isInside<T>(tree: SidebarTree<T>, key: string, ancestor: string): boolean {
  for (let node = tree.nodes.get(key); node && node.parent !== ROOT; ) {
    if (node.parent === ancestor) return true;
    node = tree.nodes.get(node.parent);
  }
  return false;
}

export function dropPositionAt(
  ratio: number,
  canDropInside: boolean,
  childrenShown: boolean,
): SidebarDropPosition {
  if (!canDropInside) return ratio < HALF ? 'before' : childrenShown ? 'inside' : 'after';
  if (ratio < OUTER_EDGE) return 'before';
  if (childrenShown || ratio <= 1 - OUTER_EDGE) return 'inside';
  return 'after';
}

function settled<T>(tree: SidebarTree<T>, move: SidebarTreeMove): SidebarTreeMove | null {
  const source = tree.nodes.get(move.key);
  if (!source) return null;
  if (move.parent === move.key) return null;
  if (move.parent !== ROOT && isInside(tree, move.parent, move.key)) return null;

  const sameParent = source.parent === move.parent;
  const index = sameParent && source.index < move.index ? move.index - 1 : move.index;
  if (sameParent && index === source.index) return null;
  return { ...move, index };
}

export function moveForDrop<T>(tree: SidebarTree<T>, key: string, drop: SidebarDrop) {
  const target = tree.nodes.get(drop.key);
  if (!target || drop.key === key) return null;

  if (drop.position === 'inside') return settled(tree, { key, parent: target.key, index: 0 });
  return settled(tree, {
    key,
    parent: target.parent,
    index: drop.position === 'before' ? target.index : target.index + 1,
  });
}

export function drawnDrop<T>(
  tree: SidebarTree<T>,
  drop: SidebarDrop,
  isVisible: (key: string) => boolean,
): SidebarDrop {
  if (drop.position !== 'inside') return drop;
  const first = tree.nodes.get(drop.key)?.children[0];
  return first !== undefined && isVisible(first) ? { key: first, position: 'before' } : drop;
}

function withChildren<T extends SidebarTreeItem<T>>(item: T, children: readonly T[]): T {
  return { ...item, children };
}

function removeAt<T extends SidebarTreeItem<T>>(
  list: readonly T[],
  path: readonly SidebarTreeId[],
): T[] {
  const [id, ...rest] = path;
  if (rest.length === 0) return list.filter((item) => item.id !== id);
  return list.map((item) =>
    item.id === id ? withChildren(item, removeAt(item.children ?? [], rest)) : item,
  );
}

function insertAt<T extends SidebarTreeItem<T>>(
  list: readonly T[],
  path: readonly SidebarTreeId[],
  index: number,
  moved: T,
): T[] {
  if (path.length === 0) return [...list.slice(0, index), moved, ...list.slice(index)];
  const [id, ...rest] = path;
  return list.map((item) =>
    item.id === id ? withChildren(item, insertAt(item.children ?? [], rest, index, moved)) : item,
  );
}

export function placeOf<T>(tree: SidebarTree<T>, key: string): SidebarPlace<T> {
  const node = tree.nodes.get(key)!;
  const ancestors: T[] = [];
  for (let parent = node.parent; parent !== ROOT; ) {
    const ancestor = tree.nodes.get(parent)!;
    ancestors.unshift(ancestor.item);
    parent = ancestor.parent;
  }
  const siblings = siblingKeysOf(tree, node.parent);
  const itemAt = (index: number) => {
    const sibling = siblings[index];
    return sibling === undefined ? null : tree.nodes.get(sibling)!.item;
  };

  return {
    parent: ancestors.at(-1) ?? null,
    ancestors,
    index: node.index,
    previousSibling: itemAt(node.index - 1),
    nextSibling: itemAt(node.index + 1),
  };
}

export type SidebarDescribedMove<T> = { items: T[]; move: SidebarMove<T>; key: string };

export function describeMove<T extends SidebarTreeItem<T>>(
  items: readonly T[],
  tree: SidebarTree<T>,
  move: SidebarTreeMove,
): SidebarDescribedMove<T> {
  const source = tree.nodes.get(move.key)!;
  const parentPath = move.parent === ROOT ? [] : tree.nodes.get(move.parent)!.path;
  const next = insertAt(removeAt(items, source.path), parentPath, move.index, source.item);
  const nextTree = buildTree(next);
  const key = treeKeyOf([...parentPath, source.item.id]);
  const to = placeOf(nextTree, key);

  return {
    items: next,
    move: { item: nextTree.nodes.get(key)!.item, from: placeOf(tree, move.key), to },
    key,
  };
}

export type SidebarKeyboardStop = { drop: SidebarDrop; move: SidebarTreeMove | null };

export function keyboardStops<T>(
  tree: SidebarTree<T>,
  key: string,
  isVisible: (key: string) => boolean,
  isAllowed: (move: SidebarTreeMove) => boolean,
): SidebarKeyboardStop[] {
  const stops: SidebarKeyboardStop[] = [];
  const seen = new Set<string>();
  const source = tree.nodes.get(key)!;
  const origin = `${source.parent}|${source.index}`;

  const add = (drop: SidebarDrop) => {
    const move = moveForDrop(tree, key, drop);
    const stopKey = move ? `${move.parent}|${move.index}` : origin;
    const isOrigin = move === null;
    if (isOrigin && drop.key !== key) return;
    if (seen.has(stopKey) || (move && !isAllowed(move))) return;
    seen.add(stopKey);
    stops.push({ drop, move });
  };

  const visit = (keys: readonly string[]) =>
    keys.forEach((nodeKey, index) => {
      if (!isVisible(nodeKey)) return;
      add({ key: nodeKey, position: 'before' });
      if (nodeKey !== key) {
        add({ key: nodeKey, position: 'inside' });
        visit(tree.nodes.get(nodeKey)!.children);
      }
      if (index === keys.length - 1) add({ key: nodeKey, position: 'after' });
    });

  visit(tree.roots);
  return stops;
}
