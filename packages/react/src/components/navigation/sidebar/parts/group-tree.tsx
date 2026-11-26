'use client';

import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

import { useInternalSidebarContext } from '../context';
import { SidebarItem, type SidebarItemProps } from './item';
import { SidebarList } from './list';
import { SidebarSortable } from './sortable';
import { elementTypeOf } from '../../../../utils';
import { useInternalSidebarTree } from '../hooks/use-sidebar-tree';
import { useInternalSidebarTreeWarnings } from '../hooks/use-sidebar-tree-warnings';
import {
  TREE_KEY_PROP,
  type SidebarMove,
  type SidebarTree,
  type SidebarTreeItem,
} from '../lib/tree';

export type SidebarGroupItemState = { depth: number };

export type SidebarGroupTreeSortable<T> = {
  onItemsChange: (items: T[], move: SidebarMove<T>) => void;
  canMove?: (move: SidebarMove<T>) => boolean;
};

export type SidebarGroupTreeProps<T extends SidebarTreeItem<T>> = {
  items: readonly T[];
  sortable?: SidebarGroupTreeSortable<NoInfer<T>>;
  children: (item: NoInfer<T>, state: SidebarGroupItemState) => ReactNode;
};

type RenderItem<T> = (item: T, state: SidebarGroupItemState) => ReactNode;

function withNestedItems(
  element: ReactElement<SidebarItemProps>,
  key: string,
  nested: ReactNode[],
) {
  const ownProps = { key, [TREE_KEY_PROP]: key } as Partial<SidebarItemProps>;
  if (nested.length === 0) return cloneElement(element, ownProps);

  const { asChild, children } = element.props;
  if (asChild && isValidElement<{ children?: ReactNode }>(children))
    return cloneElement(
      element,
      ownProps,
      cloneElement(children, undefined, children.props.children, ...nested),
    );
  return cloneElement(element, ownProps, children, ...nested);
}

function renderRows<T>(tree: SidebarTree<T>, keys: readonly string[], render: RenderItem<T>) {
  let everyRowIsAnItem = true;

  const rowsOf = (rowKeys: readonly string[]): ReactNode[] =>
    rowKeys.map((key) => {
      const node = tree.nodes.get(key)!;
      const row = render(node.item, { depth: node.depth });
      const nested = rowsOf(node.children);

      if (isValidElement<SidebarItemProps>(row) && elementTypeOf(row) === SidebarItem)
        return withNestedItems(row, key, nested);
      everyRowIsAnItem = false;
      return <Fragment key={key}>{row}</Fragment>;
    });

  return { rows: rowsOf(keys), everyRowIsAnItem };
}

export function SidebarGroupTree<T extends SidebarTreeItem<T>>({
  items,
  sortable,
  children,
}: SidebarGroupTreeProps<T>) {
  const { rail, presentation } = useInternalSidebarContext('Sidebar.Group.Tree');
  const tree = useInternalSidebarTree(items);
  const { rows, everyRowIsAnItem } = renderRows(tree, tree.roots, children);
  useInternalSidebarTreeWarnings(everyRowIsAnItem, tree.duplicates.join(', '));

  const list = <SidebarList>{rows}</SidebarList>;
  if (!sortable || rail || presentation === 'drawer') return list;

  return (
    <SidebarSortable
      items={items}
      tree={tree}
      onItemsChange={sortable.onItemsChange}
      canMove={sortable.canMove}
    >
      {list}
    </SidebarSortable>
  );
}

SidebarGroupTree.displayName = 'Sidebar.Group.Tree';
