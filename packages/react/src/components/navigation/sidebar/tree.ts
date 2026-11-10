import { isValidElement, type ReactElement, type ReactNode } from 'react';

import { elementTypeOf, flattenFragments } from '../../../utils';

export type SidebarItemMove = {
  value: string;
  parent: string | null;
  index: number;
};

export type SidebarDropPosition = 'before' | 'after' | 'inside';

export type SidebarDrop = { value: string; position: SidebarDropPosition };

export type SidebarTreeNode = {
  value: string;
  parent: string | null;
  index: number;
  children: string[];
};

export type SidebarTree = Map<string, SidebarTreeNode>;

export type SidebarMovableItem<T> = { value: string; children?: T[] };

type ItemProps = { value?: string; asChild?: boolean; children?: ReactNode };

const ROOT = null;
const OUTER_EDGE = 0.25;

export function itemElementsOf(children: ReactNode, itemType: unknown) {
  return flattenFragments(children).filter(
    (node): node is ReactElement<ItemProps> =>
      isValidElement(node) && elementTypeOf(node) === itemType,
  );
}

function ownChildrenOf(item: ReactElement<ItemProps>): ReactNode {
  const { asChild, children } = item.props;
  if (asChild && isValidElement<{ children?: ReactNode }>(children)) return children.props.children;
  return children;
}

export function collectTree(children: ReactNode, itemType: unknown) {
  const tree: SidebarTree = new Map();
  let everyItemHasAValue = true;

  const visit = (nodes: ReactNode, parent: string | null) => {
    const items = itemElementsOf(nodes, itemType);
    const values: string[] = [];

    items.forEach((item, index) => {
      const { value } = item.props;
      if (value === undefined) {
        everyItemHasAValue = false;
        return;
      }
      values.push(value);
      tree.set(value, { value, parent, index, children: visit(ownChildrenOf(item), value) });
    });

    return values;
  };

  visit(children, ROOT);
  return { tree, everyItemHasAValue };
}

export function isInside(tree: SidebarTree, value: string, ancestor: string): boolean {
  for (let node = tree.get(value); node; node = tree.get(node.parent ?? '')) {
    if (node.parent === ancestor) return true;
    if (node.parent === ROOT) return false;
  }
  return false;
}

export function dropPositionAt(ratio: number, hasChildren: boolean): SidebarDropPosition {
  if (ratio < OUTER_EDGE) return 'before';
  if (hasChildren || ratio <= 1 - OUTER_EDGE) return 'inside';
  return 'after';
}

function siblingsOf(tree: SidebarTree, parent: string | null) {
  return [...tree.values()].filter((node) => node.parent === parent);
}

function settled(tree: SidebarTree, move: SidebarItemMove): SidebarItemMove | null {
  const source = tree.get(move.value);
  if (!source) return null;
  if (move.parent === move.value) return null;
  if (move.parent !== ROOT && isInside(tree, move.parent, move.value)) return null;

  const sameParent = source.parent === move.parent;
  const index = sameParent && source.index < move.index ? move.index - 1 : move.index;
  if (sameParent && index === source.index) return null;
  return { ...move, index };
}

export function moveForDrop(tree: SidebarTree, value: string, drop: SidebarDrop) {
  const target = tree.get(drop.value);
  if (!target || drop.value === value) return null;

  if (drop.position === 'inside') return settled(tree, { value, parent: target.value, index: 0 });
  return settled(tree, {
    value,
    parent: target.parent,
    index: drop.position === 'before' ? target.index : target.index + 1,
  });
}

export type SidebarMoveKey = 'up' | 'down' | 'indent' | 'outdent';

export function moveForKey(tree: SidebarTree, value: string, key: SidebarMoveKey) {
  const node = tree.get(value);
  if (!node) return null;
  const siblings = siblingsOf(tree, node.parent);

  switch (key) {
    case 'up':
      return node.index > 0 ? { value, parent: node.parent, index: node.index - 1 } : null;
    case 'down':
      return node.index < siblings.length - 1
        ? { value, parent: node.parent, index: node.index + 1 }
        : null;
    case 'indent': {
      const previous = siblings.find((sibling) => sibling.index === node.index - 1);
      return previous ? { value, parent: previous.value, index: previous.children.length } : null;
    }
    case 'outdent': {
      const parent = tree.get(node.parent ?? '');
      return parent ? { value, parent: parent.parent, index: parent.index + 1 } : null;
    }
  }
}

export function moveSidebarItem<T extends SidebarMovableItem<T>>(
  items: readonly T[],
  move: SidebarItemMove,
): T[] {
  let moved: T | undefined;

  const without = (list: readonly T[]): T[] =>
    list.flatMap((item) => {
      if (item.value === move.value) {
        moved = item;
        return [];
      }
      return item.children ? [{ ...item, children: without(item.children) }] : [item];
    });

  const into = (list: readonly T[], parent: string | null): T[] => {
    if (parent === move.parent)
      return [...list.slice(0, move.index), moved!, ...list.slice(move.index)];
    return list.map((item) =>
      item.children || item.value === move.parent
        ? { ...item, children: into(item.children ?? [], item.value) }
        : item,
    );
  };

  const rest = without(items);
  return moved ? into(rest, ROOT) : [...items];
}
