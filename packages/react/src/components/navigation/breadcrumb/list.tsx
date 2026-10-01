'use client';

import { isValidElement, useEffect, type ComponentProps, type ReactNode } from 'react';

import { useBreadcrumbContext } from './context';
import { BreadcrumbEllipsis } from './ellipsis';
import { BreadcrumbItem } from './item';
import { BreadcrumbSeparator } from './separator';
import { elementTypeOf, flattenFragments } from '../../../utils';
import { isDevelopment } from '../../../utils/dev';

export type BreadcrumbListProps = ComponentProps<'ol'>;

const isOfType = (node: ReactNode, type: unknown) =>
  isValidElement(node) && elementTypeOf(node) === type;

const isItem = (node: ReactNode) => isOfType(node, BreadcrumbItem);
const isEllipsis = (node: ReactNode) => isOfType(node, BreadcrumbEllipsis);
const isCrumb = (node: ReactNode) => isItem(node) || isEllipsis(node);
const isSeparator = (node: ReactNode) => isOfType(node, BreadcrumbSeparator);

function collapseMiddle(nodes: ReactNode[], maxItems: number) {
  const items = nodes.filter(isItem);
  const keptAtTheEnd = Math.max(1, maxItems - 1);
  const hidden = items.slice(1, items.length - keptAtTheEnd);

  if (items.length <= maxItems || hidden.length === 0) return nodes;

  const hiddenSet = new Set(hidden);

  return nodes.flatMap<ReactNode>((node) => {
    if (node === hidden[0])
      return [<BreadcrumbEllipsis key="collapsed">{hidden}</BreadcrumbEllipsis>];

    return hiddenSet.has(node) ? [] : [node];
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
  if (nodes.some(isSeparator)) return nodes;

  const collapses = maxItems !== undefined && !nodes.some(isEllipsis);

  return separateCrumbs(collapses ? collapseMiddle(nodes, maxItems) : nodes);
}

export function BreadcrumbList({ className, children, ...props }: BreadcrumbListProps) {
  const { styles, maxItems } = useBreadcrumbContext('Breadcrumb.List');
  const nodes = flattenFragments(children);

  const empty = nodes.length === 0;

  useEffect(() => {
    if (isDevelopment && empty)
      console.warn('[IDS] Breadcrumb: add at least one Breadcrumb.Item to the trail.');
  }, [empty]);

  return (
    <ol {...props} data-breadcrumb-list="" className={styles.list({ className })}>
      {arrange(nodes, maxItems)}
    </ol>
  );
}

BreadcrumbList.displayName = 'Breadcrumb.List';
