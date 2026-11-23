'use client';

import { isValidElement, type ComponentProps, type ReactNode } from 'react';

import { useInternalBreadcrumbContext } from '../context';
import { BreadcrumbEllipsis } from './ellipsis';
import { BreadcrumbSeparator } from './separator';
import { flattenFragments } from '../../../../utils';
import { useInternalBreadcrumbListEmptyWarning } from '../hooks/use-breadcrumb-list-empty-warning';
import { isCrumb, isEllipsis, isItem, isSeparator } from '../lib/crumb-kinds';

export type BreadcrumbListProps = ComponentProps<'ol'>;

function collapseMiddle(nodes: ReactNode[], maxItems: number) {
  const items = nodes.filter(isItem);
  const keptAtTheEnd = Math.max(1, maxItems - 1);
  const hidden = items.slice(1, items.length - keptAtTheEnd);

  if (items.length <= maxItems || hidden.length === 0) return nodes;

  const hiddenSet = new Set(hidden);
  const dropped = new Set(
    nodes.filter((node, index) => hiddenSet.has(nodes[index + 1]) && isSeparator(node)),
  );
  dropped.delete(nodes[nodes.indexOf(hidden[0]) - 1]);

  return nodes.flatMap<ReactNode>((node) => {
    if (node === hidden[0])
      return [<BreadcrumbEllipsis key="collapsed">{hidden}</BreadcrumbEllipsis>];

    return hiddenSet.has(node) || dropped.has(node) ? [] : [node];
  });
}

function separateCrumbs(nodes: ReactNode[]) {
  let seenCrumb = false;

  return nodes.flatMap<ReactNode>((node) => {
    if (!isValidElement(node) || !isCrumb(node)) return [node];

    const needsSeparator = seenCrumb;
    seenCrumb = true;

    return needsSeparator ? [<BreadcrumbSeparator key={`separator:${node.key}`} />, node] : [node];
  });
}

function arrange(nodes: ReactNode[], maxItems: number | undefined) {
  const collapses = maxItems !== undefined && !nodes.some(isEllipsis);
  const collapsed = collapses ? collapseMiddle(nodes, maxItems) : nodes;

  return nodes.some(isSeparator) ? collapsed : separateCrumbs(collapsed);
}

export function BreadcrumbList({ className, children, ...props }: BreadcrumbListProps) {
  const { styles, maxItems } = useInternalBreadcrumbContext('Breadcrumb.List');
  const nodes = flattenFragments(children);
  useInternalBreadcrumbListEmptyWarning(nodes.length === 0);

  return (
    <ol {...props} data-breadcrumb-list="" className={styles.list({ className })}>
      {arrange(nodes, maxItems)}
    </ol>
  );
}

BreadcrumbList.displayName = 'Breadcrumb.List';
