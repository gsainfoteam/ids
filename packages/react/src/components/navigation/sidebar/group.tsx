'use client';

import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';

import { SidebarListContext, useSidebarContext } from './context';
import { SidebarItem, type SidebarItemProps } from './item';
import { SidebarSortable } from './sortable';
import {
  buildTree,
  TREE_KEY_PROP,
  type SidebarMove,
  type SidebarTree,
  type SidebarTreeId,
  type SidebarTreeItem,
} from './tree';
import { elementTypeOf } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';
import { Accordion } from '../../data/accordion';

type SidebarGroupBaseProps = Omit<ComponentProps<'section'>, 'children'> & {
  label?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export type SidebarGroupProps = SidebarGroupBaseProps & {
  items?: never;
  onItemsChange?: never;
  canMove?: never;
  children?: ReactNode;
};

export type SidebarGroupItemState = { depth: number };

export type SidebarGroupItemsProps<T extends SidebarTreeItem<T>> = SidebarGroupBaseProps & {
  items: readonly T[];
  onItemsChange?: (items: NoInfer<T>[], move: SidebarMove<NoInfer<T>>) => void;
  canMove?: (move: SidebarMove<NoInfer<T>>) => boolean;
  children: (item: NoInfer<T>, state: SidebarGroupItemState) => ReactNode;
};

type AnyTreeItem = { id: SidebarTreeId; children?: readonly AnyTreeItem[] };

type RenderItem<T> = (item: T, state: SidebarGroupItemState) => ReactNode;

const GROUP = 'group';

export function SidebarList({ children }: { children?: ReactNode }) {
  const { styles } = useSidebarContext('Sidebar.Group');

  return (
    <SidebarListContext value>
      <ul className={styles.list()}>
        {Children.map(children, (child) =>
          isValidElement(child) && elementTypeOf(child) === SidebarItem ? (
            child
          ) : child == null || typeof child === 'boolean' ? (
            child
          ) : (
            <li className={styles.listItem()}>{child}</li>
          ),
        )}
      </ul>
    </SidebarListContext>
  );
}

function withNestedItems(element: ReactElement<SidebarItemProps>, key: string, nested: ReactNode[]) {
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

function SidebarTreeList<T extends SidebarTreeItem<T>>({
  items,
  onItemsChange,
  canMove,
  render,
}: {
  items: readonly T[];
  onItemsChange?: (items: T[], move: SidebarMove<T>) => void;
  canMove?: (move: SidebarMove<T>) => boolean;
  render: RenderItem<T>;
}) {
  const { rail, presentation } = useSidebarContext('Sidebar.Group');
  const tree = useMemo(() => buildTree(items), [items]);
  const { rows, everyRowIsAnItem } = renderRows(tree, tree.roots, render);
  const duplicates = tree.duplicates.join(', ');

  useEffect(() => {
    if (!isDevelopment || everyRowIsAnItem) return;
    console.warn(
      '[IDS] `<Sidebar.Group items>` places each item’s children under the row its function returns, and drags that row. Return a `<Sidebar.Item>` from the function, not a component that renders one.',
    );
  }, [everyRowIsAnItem]);

  useEffect(() => {
    if (!isDevelopment || duplicates === '') return;
    console.warn(
      `[IDS] \`<Sidebar.Group items>\` found the id ${duplicates} twice under one parent. Ids only need to differ between siblings, but there they must; the repeated items are left out.`,
    );
  }, [duplicates]);

  const list = <SidebarList>{rows}</SidebarList>;
  if (!onItemsChange || rail || presentation === 'drawer') return list;

  return (
    <SidebarSortable items={items} tree={tree} onItemsChange={onItemsChange} canMove={canMove}>
      {list}
    </SidebarSortable>
  );
}

function SidebarGroupBody({
  items,
  onItemsChange,
  canMove,
  children,
}: Pick<SidebarGroupItemsProps<AnyTreeItem>, 'onItemsChange' | 'canMove'> & {
  items: readonly AnyTreeItem[] | undefined;
  children: ReactNode | RenderItem<AnyTreeItem>;
}) {
  if (items === undefined) return <SidebarList>{children as ReactNode}</SidebarList>;

  return (
    <SidebarTreeList
      items={items}
      onItemsChange={onItemsChange}
      canMove={canMove}
      render={children as RenderItem<AnyTreeItem>}
    />
  );
}

export function SidebarGroup<T extends SidebarTreeItem<T>>(
  props: SidebarGroupItemsProps<T>,
): ReactElement;
export function SidebarGroup(props: SidebarGroupProps): ReactElement;
export function SidebarGroup({
  label,
  collapsible = false,
  defaultOpen = true,
  items,
  onItemsChange,
  canMove,
  className,
  children,
  ...props
}: SidebarGroupProps | SidebarGroupItemsProps<AnyTreeItem>) {
  const { styles, rail } = useSidebarContext('Sidebar.Group');
  const labelId = useId();
  const body = (
    <SidebarGroupBody items={items} onItemsChange={onItemsChange} canMove={canMove}>
      {children}
    </SidebarGroupBody>
  );

  if (collapsible && label !== undefined && !rail)
    return (
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? GROUP : null}
        variant="ghost"
        size="tiny"
        data-sidebar-group=""
        className={styles.group({ className })}
      >
        <Accordion.Item value={GROUP}>
          <Accordion.Header asChild>
            <div>
              <Accordion.Trigger className={styles.groupTrigger()}>{label}</Accordion.Trigger>
            </div>
          </Accordion.Header>
          <Accordion.Content className="p-0">{body}</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

  return (
    <section
      {...props}
      aria-labelledby={label !== undefined ? labelId : props['aria-labelledby']}
      data-sidebar-group=""
      className={styles.group({ className })}
    >
      {label !== undefined && (
        <div id={labelId} className={styles.groupLabel()}>
          {label}
        </div>
      )}
      {body}
    </section>
  );
}

SidebarGroup.displayName = 'Sidebar.Group';
